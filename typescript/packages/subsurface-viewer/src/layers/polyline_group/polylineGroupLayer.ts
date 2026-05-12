import type {
    Color,
    FilterContext,
    PickingInfo,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import { PathLayer } from "@deck.gl/layers";
import { DataFilterExtension, PathStyleExtension } from "@deck.gl/extensions";
import { isEqual } from "lodash";

import type {
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";
import { SectionViewport } from "../../viewports";
import type { Position } from "@deck.gl/core";

// ---------------------------------------------------------------------------
// Public data types
// ---------------------------------------------------------------------------

export type Position2D = [number, number];

export type Polyline = {
    id?: string | number;
    path: Position[];
    color?: Color;
    width?: number;
    dashArray?: [number, number];
};

/**
 * Binary format for high-performance rendering of large polyline sets.
 * `positions` is a flat interleaved Float32Array: [x,y,z, x,y,z, ...].
 * `startIndices` contains the vertex index where each polyline begins;
 * the last polyline ends at the end of the positions array.
 * Per-polyline color/width overrides are not supported — use group-level values.
 */
export type BinaryPolylines = {
    positions: Float32Array;
    startIndices: Uint32Array;
};

export type PolylineGroup = {
    id?: string | number;
    name?: string;
    color?: Color;
    width?: number;
    dashArray?: [number, number];
    polylines: Polyline[] | BinaryPolylines;
};

// ---------------------------------------------------------------------------
// Layer props
// ---------------------------------------------------------------------------

export interface PolylineGroupLayerProps extends ExtendedLayerProps {
    /**
     * Array of polyline groups. Each group holds a set of polylines and
     * optional group-level color/width defaults.
     */
    data: PolylineGroup[];

    // -- Group-level accessors -----------------------------------------------

    getGroupColor?: (group: PolylineGroup) => Color | null | undefined;
    getGroupWidth?: (group: PolylineGroup) => number | null | undefined;

    // -- Polyline-level overrides --------------------------------------------

    getPolylineColor?: (
        polyline: Polyline,
        group: PolylineGroup
    ) => Color | null | undefined;
    getPolylineWidth?: (
        polyline: Polyline,
        group: PolylineGroup
    ) => number | null | undefined;

    // -- Geometry accessors --------------------------------------------------

    /** Extract the polylines from a group object. Defaults to `g.polylines`. */
    getGroupPolylines?: (group: PolylineGroup) => Polyline[] | BinaryPolylines;
    /** Extract the path positions from a polyline object. Defaults to `p.path`. */
    getPolylinePath?: (polyline: Polyline, group: PolylineGroup) => Position[];

    // -- Fallback defaults ---------------------------------------------------

    defaultGroupColor?: Color;
    defaultGroupWidth?: number;

    // -- Width / rendering controls ------------------------------------------

    widthUnits?: "meters" | "common" | "pixels";
    widthScale?: number;
    widthMinPixels?: number;
    widthMaxPixels?: number;
    jointRounded?: boolean;
    capRounded?: boolean;
    miterLimit?: number;
    /** If true, the path always faces the camera. Default: true. */
    billboard?: boolean;

    // -- Depth ---------------------------------------------------------------

    /**
     * If true, input Z values are interpreted as depths (positive = down),
     * so they are negated before rendering. Default: true.
     */
    ZIncreasingDownwards?: boolean;

    /** Enable/disable depth testing when rendering layer. Default: true. */
    depthTest?: boolean;

    // -- Visibility ----------------------------------------------------------

    /**
     * Set of group ids to hide. Groups not in the set remain visible.
     * Uses GPU-side filtering — no re-flatten required when changed.
     */
    hiddenGroups?: Set<string | number>;

    /**
     * Set of polyline ids to hide. Only applies to polylines defined via
     * the `Polyline[]` format (ids are unavailable in BinaryPolylines).
     * Uses GPU-side filtering — no re-flatten required when changed.
     */
    hiddenPolylines?: Set<string | number>;

    // -- Dash style ----------------------------------------------------------

    getGroupDashArray?: (
        group: PolylineGroup
    ) => [number, number] | null | undefined;
    getPolylineDashArray?: (
        polyline: Polyline,
        group: PolylineGroup
    ) => [number, number] | null | undefined;
    /** Default dash pattern `[dashLength, gapLength]` applied when no group or polyline override is set. */
    defaultGroupDashArray?: [number, number];
    /**
     * Use high-precision dash rendering (avoids dash-length variation at segment
     * joins). Slightly more expensive. Default: false.
     */
    highPrecisionDash?: boolean;

    /**
     * Path of the cross-section fence as 2-D world-space XY coordinates `[x, y]`.
     * When provided, each polyline path point is interpreted as
     * `[abscissa, depth]` where `abscissa` is the cumulative distance along this fence.
     *
     * - In a `SectionView` viewport the paths are rendered in abscissa/depth space.
     * - In a 3D viewport the abscissa values are projected back onto the fence.
     *
     * @remarks Pass a stable reference (module-level or memoized constant) to avoid
     * unnecessary re-computation of the section index.
     */
    sectionPath?: Position2D[];
}

// ---------------------------------------------------------------------------
// Internal flat entry (what PathLayer sees)
// ---------------------------------------------------------------------------

type FlatEntry = {
    path: Position[];
    color: Color;
    width: number;
    dashArray: [number, number];
    /** Undefined when the polyline originates from BinaryPolylines. */
    _polyline: Polyline | undefined;
    _group: PolylineGroup;
};

// ---------------------------------------------------------------------------
// Default props
// ---------------------------------------------------------------------------

const defaultProps: Partial<PolylineGroupLayerProps> = {
    "@@type": "PolylineGroupLayer",
    name: "PolylineGroupLayer",
    id: "polyline-group-layer",
    pickable: false,
    visible: true,
    depthTest: true,
    ZIncreasingDownwards: true,
    defaultGroupColor: [0, 128, 255, 255],
    defaultGroupWidth: 2,
    widthUnits: "meters",
    widthScale: 1,
    widthMinPixels: 0,
    widthMaxPixels: Number.MAX_SAFE_INTEGER,
    jointRounded: false,
    capRounded: false,
    miterLimit: 4,
    billboard: true,
    getGroupPolylines: (g: PolylineGroup): Polyline[] | BinaryPolylines =>
        g.polylines,
    getPolylinePath: (p: Polyline) => p.path,
};

// ---------------------------------------------------------------------------
// Resolution helpers
// ---------------------------------------------------------------------------

function resolveColor(
    polyline: Polyline,
    group: PolylineGroup,
    props: PolylineGroupLayerProps
): Color {
    const fromPolylineAccessor = props.getPolylineColor?.(polyline, group);
    if (fromPolylineAccessor != null) return fromPolylineAccessor;
    if (polyline.color != null) return polyline.color;
    const fromGroupAccessor = props.getGroupColor?.(group);
    if (fromGroupAccessor != null) return fromGroupAccessor;
    if (group.color != null) return group.color;
    return props.defaultGroupColor ?? [0, 128, 255, 255];
}

function resolveWidth(
    polyline: Polyline,
    group: PolylineGroup,
    props: PolylineGroupLayerProps
): number {
    const fromPolylineAccessor = props.getPolylineWidth?.(polyline, group);
    if (fromPolylineAccessor != null) return fromPolylineAccessor;
    if (polyline.width != null) return polyline.width;
    const fromGroupAccessor = props.getGroupWidth?.(group);
    if (fromGroupAccessor != null) return fromGroupAccessor;
    if (group.width != null) return group.width;
    return props.defaultGroupWidth ?? 2;
}

// ---------------------------------------------------------------------------
// Flatten
// ---------------------------------------------------------------------------

function isBinaryPolylines(
    p: Polyline[] | BinaryPolylines
): p is BinaryPolylines {
    return !Array.isArray(p) && "positions" in p;
}

function resolveGroupColor(
    group: PolylineGroup,
    props: PolylineGroupLayerProps
): Color {
    return (
        props.getGroupColor?.(group) ??
        group.color ??
        props.defaultGroupColor ?? [0, 128, 255, 255]
    );
}

function resolveGroupWidth(
    group: PolylineGroup,
    props: PolylineGroupLayerProps
): number {
    return (
        props.getGroupWidth?.(group) ??
        group.width ??
        props.defaultGroupWidth ??
        2
    );
}

function resolveGroupDashArray(
    group: PolylineGroup,
    props: PolylineGroupLayerProps
): [number, number] {
    return (
        props.getGroupDashArray?.(group) ??
        group.dashArray ??
        props.defaultGroupDashArray ?? [0, 0]
    );
}

function resolveDashArray(
    polyline: Polyline,
    group: PolylineGroup,
    props: PolylineGroupLayerProps
): [number, number] {
    const fromPolylineAccessor = props.getPolylineDashArray?.(polyline, group);
    if (fromPolylineAccessor != null) return fromPolylineAccessor;
    if (polyline.dashArray != null) return polyline.dashArray;
    const fromGroupAccessor = props.getGroupDashArray?.(group);
    if (fromGroupAccessor != null) return fromGroupAccessor;
    if (group.dashArray != null) return group.dashArray;
    return props.defaultGroupDashArray ?? [0, 0];
}

function flattenGroupData(
    data: PolylineGroup[],
    props: PolylineGroupLayerProps
): FlatEntry[] {
    const getPolylines =
        props.getGroupPolylines ??
        ((g: PolylineGroup): Polyline[] | BinaryPolylines => g.polylines);
    const getPath = props.getPolylinePath ?? ((p: Polyline) => p.path);
    const result: FlatEntry[] = [];

    for (const group of data) {
        const polylines = getPolylines(group);

        if (isBinaryPolylines(polylines)) {
            const { positions, startIndices } = polylines;
            const color = resolveGroupColor(group, props);
            const width = resolveGroupWidth(group, props);
            const dashArray = resolveGroupDashArray(group, props);
            for (let i = 0; i < startIndices.length; i++) {
                const start = startIndices[i];
                const end =
                    i + 1 < startIndices.length
                        ? startIndices[i + 1]
                        : positions.length / 3;
                const path: Position[] = [];
                for (let v = start; v < end; v++) {
                    path.push([
                        positions[v * 3],
                        positions[v * 3 + 1],
                        positions[v * 3 + 2],
                    ]);
                }
                result.push({
                    path,
                    color,
                    width,
                    dashArray,
                    _polyline: undefined,
                    _group: group,
                });
            }
        } else {
            for (const polyline of polylines) {
                result.push({
                    path: getPath(polyline, group),
                    color: resolveColor(polyline, group, props),
                    width: resolveWidth(polyline, group, props),
                    dashArray: resolveDashArray(polyline, group, props),
                    _polyline: polyline,
                    _group: group,
                });
            }
        }
    }
    return result;
}

// ---------------------------------------------------------------------------
// Section-path utilities
// ---------------------------------------------------------------------------

/** Precomputed data for projecting abscissa values onto the fence. */
type SectionIndex = { cumDist: number[]; path: Position2D[] };

function buildSectionIndex(path: Position2D[]): SectionIndex {
    const cumDist: number[] = [0];
    for (let i = 1; i < path.length; i++) {
        const dx = path[i][0] - path[i - 1][0];
        const dy = path[i][1] - path[i - 1][1];
        cumDist.push(cumDist[i - 1] + Math.sqrt(dx * dx + dy * dy));
    }
    return { cumDist, path };
}

/** Return the (x, y) world position on the fence at the given cumulative distance. */
function projectAbscissa(
    abscissa: number,
    idx: SectionIndex
): [number, number] {
    const { cumDist, path } = idx;
    if (path.length === 0) return [0, 0];
    if (abscissa <= cumDist[0]) return [path[0][0], path[0][1]];
    const last = cumDist.length - 1;
    if (abscissa >= cumDist[last]) return [path[last][0], path[last][1]];
    let lo = 0,
        hi = last;
    while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (cumDist[mid] <= abscissa) lo = mid;
        else hi = mid;
    }
    const t = (abscissa - cumDist[lo]) / (cumDist[hi] - cumDist[lo]);
    return [
        path[lo][0] + t * (path[hi][0] - path[lo][0]),
        path[lo][1] + t * (path[hi][1] - path[lo][1]),
    ];
}

// ---------------------------------------------------------------------------
// Layer class
// ---------------------------------------------------------------------------

export class PolylineGroupLayer extends CompositeLayer<PolylineGroupLayerProps> {
    initializeState(): void {
        const { data, sectionPath } = this.props;
        this.setState({
            flatData: flattenGroupData(data, this.props),
            sectionIndex: sectionPath ? buildSectionIndex(sectionPath) : null,
        });
    }

    updateState({
        props,
        oldProps,
    }: UpdateParameters<PolylineGroupLayer>): void {
        const needsRebuild =
            !isEqual(props.data, oldProps.data) ||
            props.getGroupColor !== oldProps.getGroupColor ||
            props.getGroupWidth !== oldProps.getGroupWidth ||
            props.getPolylineColor !== oldProps.getPolylineColor ||
            props.getPolylineWidth !== oldProps.getPolylineWidth ||
            props.getGroupPolylines !== oldProps.getGroupPolylines ||
            props.getPolylinePath !== oldProps.getPolylinePath ||
            props.defaultGroupColor !== oldProps.defaultGroupColor ||
            props.defaultGroupWidth !== oldProps.defaultGroupWidth ||
            props.ZIncreasingDownwards !== oldProps.ZIncreasingDownwards;

        if (needsRebuild) {
            this.setState({ flatData: flattenGroupData(props.data, props) });
        }
        if (props.sectionPath !== oldProps.sectionPath) {
            this.setState({
                sectionIndex: props.sectionPath
                    ? buildSectionIndex(props.sectionPath)
                    : null,
            });
        }
    }

    filterSubLayer({ layer, viewport }: FilterContext): boolean {
        const isSV = viewport.constructor === SectionViewport;
        if (layer.id.endsWith("-paths-section")) return isSV;
        if (layer.id.endsWith("-paths-3d")) return !isSV;
        return true;
    }

    renderLayers(): PathLayer[] {
        const flatData = this.state["flatData"] as FlatEntry[];
        const sectionIndex = this.state["sectionIndex"] as SectionIndex | null;
        const {
            widthUnits,
            widthScale,
            widthMinPixels,
            widthMaxPixels,
            jointRounded,
            capRounded,
            miterLimit,
            billboard,
            pickable,
            depthTest,
            ZIncreasingDownwards,
            hiddenGroups,
            hiddenPolylines,
            defaultGroupDashArray,
            getGroupDashArray,
            getPolylineDashArray,
            highPrecisionDash,
        } = this.props;

        const hasDash =
            defaultGroupDashArray != null ||
            getGroupDashArray != null ||
            getPolylineDashArray != null;

        // Shared sub-layer props for everything except getPath / updateTriggers.getPath
        const sharedProps = {
            data: flatData,
            pickable,
            billboard,
            widthUnits,
            widthScale,
            widthMinPixels,
            widthMaxPixels,
            jointRounded,
            capRounded,
            miterLimit,
            parameters: { depthTest },
            extensions: [
                new DataFilterExtension({ filterSize: 1 }),
                ...(hasDash
                    ? [
                          new PathStyleExtension({
                              dash: true,
                              highPrecisionDash: highPrecisionDash ?? false,
                          }),
                      ]
                    : []),
            ],
            getFilterValue: (d: FlatEntry) => {
                if (d._group.id != null && hiddenGroups?.has(d._group.id))
                    return 0;
                if (
                    d._polyline?.id != null &&
                    hiddenPolylines?.has(d._polyline.id)
                )
                    return 0;
                return 1;
            },
            filterRange: [1, 1] as [number, number],
            getColor: (d: FlatEntry) => d.color,
            getWidth: (d: FlatEntry) => d.width,
            getDashArray: (d: FlatEntry) => d.dashArray,
        };

        const updateTriggers = {
            getFilterValue: [hiddenGroups, hiddenPolylines],
            getColor: [flatData],
            getWidth: [flatData],
            getDashArray: [flatData],
            getPath: [ZIncreasingDownwards],
        };

        if (sectionIndex) {
            // Two separate sub-layers — one per coordinate system — so each has
            // its own GPU attribute buffer. filterSubLayer() routes each to the
            // appropriate viewport type (SectionViewport vs. 3D).
            const sectionUpdateTriggers = {
                ...updateTriggers,
                getPath: [...updateTriggers.getPath, sectionIndex],
            };
            return [
                new PathLayer(
                    this.getSubLayerProps({
                        ...sharedProps,
                        id: "paths-section",
                        getPath: (d: FlatEntry) =>
                            d.path.map((pt) => {
                                const z = ZIncreasingDownwards ? -pt[1] : pt[1];
                                return [pt[0], z, 0] as Position;
                            }),
                        updateTriggers: sectionUpdateTriggers,
                    })
                ),
                new PathLayer(
                    this.getSubLayerProps({
                        ...sharedProps,
                        id: "paths-3d",
                        getPath: (d: FlatEntry) =>
                            d.path.map((pt) => {
                                const z = ZIncreasingDownwards ? -pt[1] : pt[1];
                                const [wx, wy] = projectAbscissa(
                                    pt[0],
                                    sectionIndex
                                );
                                return [wx, wy, z] as Position;
                            }),
                        updateTriggers: sectionUpdateTriggers,
                    })
                ),
            ];
        }

        return [
            new PathLayer(
                this.getSubLayerProps({
                    ...sharedProps,
                    id: "paths",
                    getPath: (d: FlatEntry) => {
                        if (!ZIncreasingDownwards) return d.path;
                        return d.path.map(
                            ([x, y, z]) => [x, y, -z] as Position
                        );
                    },
                    updateTriggers,
                })
            ),
        ];
    }

    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (!info.object) return info;

        const entry = info.object as FlatEntry;
        const layerProperties: PropertyDataType[] = [];

        if (entry._group?.name) {
            layerProperties.push(
                createPropertyData("Group", entry._group.name)
            );
        }
        if (entry._polyline?.id != null) {
            layerProperties.push(
                createPropertyData("Polyline", String(entry._polyline.id))
            );
        }

        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;
        if (typeof info.coordinate?.[2] !== "undefined") {
            const depth =
                (this.props.ZIncreasingDownwards
                    ? -info.coordinate[2]
                    : info.coordinate[2]) / Math.max(0.001, zScale);
            layerProperties.push(createPropertyData("Depth", depth));
        }

        return {
            ...info,
            // Expose the original polyline and group for onHover/onClick handlers
            object: entry._polyline,
            // @ts-expect-error -- deck.gl PickingInfo doesn't type extra fields; consumers can cast
            group: entry._group,
            properties: layerProperties,
        };
    }
}

PolylineGroupLayer.layerName = "PolylineGroupLayer";
PolylineGroupLayer.defaultProps = defaultProps;
