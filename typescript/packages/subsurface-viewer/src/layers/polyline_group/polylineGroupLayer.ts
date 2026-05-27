import type {
    Color,
    FilterContext,
    PickingInfo,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import { DataFilterExtension, PathStyleExtension } from "@deck.gl/extensions";
import type { PathLayerProps } from "@deck.gl/layers";
import { PathLayer } from "@deck.gl/layers";

import type { Position } from "@deck.gl/core";
import type { Point2D } from "../..";
import { SectionViewport } from "../../viewports";
import type {
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";

// ---------------------------------------------------------------------------
// Public data types
// ---------------------------------------------------------------------------

export type PolylineStyle = {
    color?: Color;
    width?: number;
    dashArray?: [number, number];
};

export type Polyline = PolylineStyle & {
    id?: string | number;
    /**
     * The geometry of this polyline.
     *
     * - `Position[]` — a single connected path (the common case).
     * - `PolylineGroup` — a set of disjoint segments that share the same logical
     *   identity (id, picking, visibility). Use this to represent a horizon that
     *   is cut by faults: each segment in `group.polylines` is a full `Polyline`
     *   and may carry its own `color`, `width`, and `dashArray` overrides, enabling
     *   per-segment highlighting. The parent `Polyline` acts as the logical owner.
     *
     *   One level only — segment paths must be `Position[]`; nested `PolylineGroup`
     *   paths inside segments are not supported.
     *
     *   `BinaryPolylines` inside the sub-group is not supported; use `Polyline[]`.
     */
    path: Position[] | PolylineGroup;
};

/**
 * Binary format for high-performance rendering of large polyline sets.
 * `positions` is a flat interleaved Float32Array: [x,y,z, x,y,z, ...].
 * `startIndices` contains the vertex index where each polyline begins;
 * the last polyline ends at the end of the positions array.
 * Per-polyline color/width overrides are not supported — use group-level values.
 *
 * Optionally, `colors` (Uint8Array, RGBA, normalized, length = 4 * num vertices)
 * and `widths` (Float32Array, length = num vertices) can be provided for per-vertex
 * styling. If omitted, group-level color/width will be used for all vertices.
 */
export type BinaryPolylines = {
    positions: Float32Array;
    startIndices: Uint32Array;
    colors?: Uint8Array;
    widths?: Float32Array;
};

export type PolylineGroup = PolylineStyle & {
    id?: string | number;
    name?: string;
    polylines: Polyline[] | BinaryPolylines;
};

// ---------------------------------------------------------------------------
// Layer props
// ---------------------------------------------------------------------------

/**
 * Props accepted by {@link PolylineGroupLayer}.
 *
 * Styling is resolved through a cascade for each rendered path:
 * 1. polyline-level accessor (`getPolylineColor` / `getPolylineWidth` / `getPolylineDashArray`)
 * 2. `Polyline` field (`color` / `width` / `dashArray`)
 * 3. group-level accessor (`getGroupColor` / `getGroupWidth` / `getGroupDashArray`)
 * 4. `PolylineGroup` field (`color` / `width` / `dashArray`)
 * 5. layer default (`defaultGroupColor` / `defaultGroupWidth` / `defaultGroupDashArray`)
 */
export interface PolylineGroupLayerProps
    extends ExtendedLayerProps,
        Pick<
            PathLayerProps,
            | "widthUnits"
            | "widthScale"
            | "widthMinPixels"
            | "widthMaxPixels"
            | "jointRounded"
            | "capRounded"
            | "miterLimit"
            | "billboard"
        > {
    /**
     * Array of polyline groups. Each group holds a set of polylines and
     * optional group-level color/width defaults.
     */
    data: PolylineGroup[];

    // -- Group-level accessors -----------------------------------------------

    /**
     * Return an explicit color for all polylines in `group`.
     * Takes precedence over `PolylineGroup.color`.
     * Return `null` or `undefined` to fall through to the field value.
     */
    getGroupColor?: (group: PolylineGroup) => Color | null | undefined;
    /**
     * Return an explicit width for all polylines in `group`.
     * Takes precedence over `PolylineGroup.width`.
     * Return `null` or `undefined` to fall through to the field value.
     */
    getGroupWidth?: (group: PolylineGroup) => number | null | undefined;

    // -- Polyline-level overrides --------------------------------------------

    /**
     * Return an explicit color for an individual `polyline`.
     * Takes precedence over the polyline's own `color` field and the group accessor.
     * Return `null` or `undefined` to continue down the cascade.
     */
    getPolylineColor?: (
        polyline: Polyline,
        group: PolylineGroup
    ) => Color | null | undefined;
    /**
     * Return an explicit width for an individual `polyline`.
     * Takes precedence over the polyline's own `width` field and the group accessor.
     * Return `null` or `undefined` to continue down the cascade.
     */
    getPolylineWidth?: (
        polyline: Polyline,
        group: PolylineGroup
    ) => number | null | undefined;

    // -- Geometry accessors --------------------------------------------------

    /** Extract the polylines from a group object. Defaults to `g.polylines`. */
    getGroupPolylines?: (group: PolylineGroup) => Polyline[] | BinaryPolylines;
    /**
     * Extract the path positions from a polyline object. Defaults to `p.path as Position[]`.
     * Only called on leaf polylines whose `path` is `Position[]` (i.e. not on container
     * polylines whose `path` is a `PolylineGroup`).
     */
    getPolylinePath?: (polyline: Polyline, group: PolylineGroup) => Position[];

    // -- Fallback defaults ---------------------------------------------------

    /** Fallback color used when no group or polyline color is resolved. Default: `[0, 128, 255, 255]`. */
    defaultGroupColor?: Color;
    /** Fallback line width used when no group or polyline width is resolved. Default: `2`. */
    defaultGroupWidth?: number;

    // -- Width / rendering controls — inherited from PathLayerProps ----------
    // widthUnits, widthScale, widthMinPixels, widthMaxPixels,
    // jointRounded, capRounded, miterLimit, billboard
    // Note: `billboard` defaults to `true` here; PathLayer's own default is `false`.

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
     *
     * @remarks Group ids can be defined using string or number. The set can
     * contain a mix of both, but the type of ids in the set should match the
     * type of `PolylineGroup.id` for correct filtering.
     */
    hiddenGroups?: Set<string | number>;

    /**
     * Set of polyline ids to hide. Only applies to polylines defined via
     * the `Polyline[]` format (ids are unavailable in BinaryPolylines).
     * Uses GPU-side filtering — no re-flatten required when changed.
     *
     * @remarks Polyline ids can be defined using string or number. The set can
     * contain a mix of both, but the type of ids in the set should match the
     * type of `Polyline.id` for correct filtering.
     */
    hiddenPolylines?: Set<string | number>;

    // -- Dash style ----------------------------------------------------------

    /**
     * Return a `[dashLength, gapLength]` dash pattern for all polylines in `group`.
     * Providing this accessor (even for some groups) activates `PathStyleExtension`
     * for the entire layer. Return `null` or `undefined` to fall through to the field value.
     */
    getGroupDashArray?: (
        group: PolylineGroup
    ) => [number, number] | null | undefined;

    /**
     * Return a `[dashLength, gapLength]` dash pattern for an individual `polyline`,
     * overriding the group-level pattern.
     * Return `null` or `undefined` to continue down the cascade.
     */
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
    sectionPath?: Point2D[];
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

/**
 * Combined binary data for all groups using {@link BinaryPolylines}, rendered
 * by a single PathLayer via its typed-array data path. Per-vertex attributes
 * carry the group-level color and width (replicated per vertex). Dash style is
 * not supported for binary groups.
 *
 * `pathGroup` maps each path index (used by picking) to its originating
 * {@link PolylineGroup}. `vertexGroupIndex` maps each vertex to its group index
 * within `groups`, used to rebuild the GPU filter buffer when `hiddenGroups`
 * changes without re-flattening.
 */
type BinaryData = {
    positions: Float32Array; // size 3 per vertex
    startIndices: Uint32Array; // length = number of paths + 1 (terminal entry)
    colors: Uint8Array; // size 4 per vertex
    widths: Float32Array; // size 1 per vertex
    pathGroup: PolylineGroup[]; // length = number of paths
    vertexGroupIndex: Uint32Array; // size 1 per vertex
    groups: PolylineGroup[];
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
    getPolylinePath: (p: Polyline) => p.path as Position[],
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

// ---------------------------------------------------------------------------
// Segment resolution helpers (used when polyline.path is a PolylineGroup)
// ---------------------------------------------------------------------------
// Cascade: accessor(segment) -> segment field -> subGroup field -> parent polyline
// resolution (which itself cascades through accessor -> field -> outerGroup -> default).

function resolveSegmentColor(
    segment: Polyline,
    subGroup: PolylineGroup,
    parentPolyline: Polyline,
    outerGroup: PolylineGroup,
    props: PolylineGroupLayerProps
): Color {
    const fromAccessor = props.getPolylineColor?.(segment, outerGroup);
    if (fromAccessor != null) return fromAccessor;
    if (segment.color != null) return segment.color;
    if (subGroup.color != null) return subGroup.color;
    return resolveColor(parentPolyline, outerGroup, props);
}

function resolveSegmentWidth(
    segment: Polyline,
    subGroup: PolylineGroup,
    parentPolyline: Polyline,
    outerGroup: PolylineGroup,
    props: PolylineGroupLayerProps
): number {
    const fromAccessor = props.getPolylineWidth?.(segment, outerGroup);
    if (fromAccessor != null) return fromAccessor;
    if (segment.width != null) return segment.width;
    if (subGroup.width != null) return subGroup.width;
    return resolveWidth(parentPolyline, outerGroup, props);
}

function resolveSegmentDashArray(
    segment: Polyline,
    subGroup: PolylineGroup,
    parentPolyline: Polyline,
    outerGroup: PolylineGroup,
    props: PolylineGroupLayerProps
): [number, number] {
    const fromAccessor = props.getPolylineDashArray?.(segment, outerGroup);
    if (fromAccessor != null) return fromAccessor;
    if (segment.dashArray != null) return segment.dashArray;
    if (subGroup.dashArray != null) return subGroup.dashArray;
    return resolveDashArray(parentPolyline, outerGroup, props);
}

/**
 * Expands a polyline whose `path` is a {@link PolylineGroup} (i.e. a
 * discontinuous polyline made of disjoint segments) into one {@link FlatEntry}
 * per segment. Returns an empty array and emits a warning if the sub-group
 * contains {@link BinaryPolylines}, which are not supported at the segment level.
 */
function flattenSubGroupPolyline(
    polyline: Polyline,
    subGroup: PolylineGroup,
    group: PolylineGroup,
    getPath: (p: Polyline, g: PolylineGroup) => Position[],
    props: PolylineGroupLayerProps
): FlatEntry[] {
    const segPolylines = subGroup.polylines;
    if (isBinaryPolylines(segPolylines)) {
        console.warn(
            "PolylineGroupLayer: BinaryPolylines inside a sub-group path is not supported. Skipping."
        );
        return [];
    }
    return segPolylines.flatMap((segment) => {
        if (!Array.isArray(segment.path)) {
            console.warn(
                "PolylineGroupLayer: nested PolylineGroup paths inside segment polylines are not supported. Skipping segment."
            );
            return [];
        }
        return [
            {
                path: getPath(segment, group),
                color: resolveSegmentColor(
                    segment,
                    subGroup,
                    polyline,
                    group,
                    props
                ),
                width: resolveSegmentWidth(
                    segment,
                    subGroup,
                    polyline,
                    group,
                    props
                ),
                dashArray: resolveSegmentDashArray(
                    segment,
                    subGroup,
                    polyline,
                    group,
                    props
                ),
                _polyline: polyline, // root polyline — for picking & hiddenPolylines
                _group: group,
            },
        ];
    });
}

/**
 * Allocates combined typed-array buffers and fills them from all raw binary
 * groups. Positions and indices are concatenated; color/width are replicated
 * per vertex so the GPU can read them without per-vertex JS work.
 */
function buildBinaryData(
    binaryRaw: { group: PolylineGroup; polylines: BinaryPolylines }[],
    totalVerts: number,
    totalPaths: number,
    ZIncreasingDownwards: boolean,
    props: PolylineGroupLayerProps
): BinaryData {
    const positions = new Float32Array(totalVerts * 3);
    const colors = new Uint8Array(totalVerts * 4);
    const widths = new Float32Array(totalVerts);
    const vertexGroupIndex = new Uint32Array(totalVerts);
    const startIndices = new Uint32Array(totalPaths + 1);
    const pathGroup: PolylineGroup[] = new Array(totalPaths);
    const groups: PolylineGroup[] = binaryRaw.map((b) => b.group);

    let vOffset = 0;
    let pOffset = 0;

    for (let gIdx = 0; gIdx < binaryRaw.length; gIdx++) {
        const { group, polylines } = binaryRaw[gIdx];
        const src = polylines.positions;
        const srcVerts = src.length / 3;

        // Copy positions (optionally flipping Z)
        const base = vOffset * 3;
        if (ZIncreasingDownwards) {
            for (let i = 0; i < src.length; i += 3) {
                positions[base + i] = src[i];
                positions[base + i + 1] = src[i + 1];
                positions[base + i + 2] = -src[i + 2];
            }
        } else {
            positions.set(src, base);
        }

        if (polylines.colors) {
            colors.set(polylines.colors, vOffset * 4);
        } else {
            const color = props.getGroupColor?.(group) ??
                group.color ??
                props.defaultGroupColor ?? [0, 128, 255, 255];
            // Write the first RGBA directly into the combined buffer, then
            // reinterpret that position as a Uint32 and fill it across all
            // remaining vertices in one call — no bit-shifting required.
            colors.set(
                [color[0], color[1], color[2], color[3] ?? 255],
                vOffset * 4
            );
            new Uint32Array(colors.buffer).fill(
                new Uint32Array(colors.buffer)[vOffset],
                vOffset + 1,
                vOffset + srcVerts
            );
        }

        if (polylines.widths) {
            widths.set(polylines.widths, vOffset);
        } else {
            widths.fill(
                props.getGroupWidth?.(group) ??
                    group.width ??
                    props.defaultGroupWidth ??
                    2,
                vOffset,
                vOffset + srcVerts
            );
        }

        for (let v = 0; v < srcVerts; v++) {
            vertexGroupIndex[vOffset + v] = gIdx;
        }

        // Offset and copy startIndices into the combined buffer.
        const srcIdx = polylines.startIndices;
        for (let p = 0; p < srcIdx.length; p++) {
            startIndices[pOffset + p] = srcIdx[p] + vOffset;
            pathGroup[pOffset + p] = group;
        }

        vOffset += srcVerts;
        pOffset += srcIdx.length;
    }

    startIndices[totalPaths] = totalVerts; // terminal entry

    return {
        positions,
        startIndices,
        colors,
        widths,
        pathGroup,
        vertexGroupIndex,
        groups,
    };
}

function flattenGroupData(
    data: PolylineGroup[],
    props: PolylineGroupLayerProps
): { flatData: FlatEntry[]; binaryData: BinaryData | null } {
    const getPolylines =
        props.getGroupPolylines ??
        ((g: PolylineGroup): Polyline[] | BinaryPolylines => g.polylines);
    const getPath =
        props.getPolylinePath ?? ((p: Polyline) => p.path as Position[]);
    const flatData: FlatEntry[] = [];

    const ZIncreasingDownwards = props.ZIncreasingDownwards ?? true;

    // First pass over binary groups: collect groups + sum sizes so we can
    // allocate combined typed arrays once.
    const binaryRaw: {
        group: PolylineGroup;
        polylines: BinaryPolylines;
    }[] = [];
    let totalVerts = 0;
    let totalPaths = 0;

    for (const group of data) {
        const polylines = getPolylines(group);

        if (isBinaryPolylines(polylines)) {
            if (
                group.dashArray != null ||
                props.getGroupDashArray?.(group) != null
            ) {
                console.warn(
                    "PolylineGroupLayer: dashArray is not supported on BinaryPolylines groups; ignoring."
                );
            }
            const srcVerts = polylines.positions.length / 3;
            let colors = polylines.colors;
            if (colors && colors.length !== srcVerts * 4) {
                console.warn(
                    `PolylineGroupLayer: BinaryPolylines group (id=${group.id ?? "unknown"}) has a colors buffer with wrong length (expected ${srcVerts * 4}, got ${colors.length}). Ignoring colors.`
                );
                colors = undefined;
            }
            let widths = polylines.widths;
            if (widths && widths.length !== srcVerts) {
                console.warn(
                    `PolylineGroupLayer: BinaryPolylines group (id=${group.id ?? "unknown"}) has a widths buffer with wrong length (expected ${srcVerts}, got ${widths.length}). Ignoring widths.`
                );
                widths = undefined;
            }
            binaryRaw.push({
                group,
                polylines: { ...polylines, colors, widths },
            });
            totalVerts += srcVerts;
            totalPaths += polylines.startIndices.length;
        } else {
            for (const polyline of polylines) {
                if (!Array.isArray(polyline.path)) {
                    flatData.push(
                        ...flattenSubGroupPolyline(
                            polyline,
                            polyline.path,
                            group,
                            getPath,
                            props
                        )
                    );
                } else {
                    flatData.push({
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
    }

    if (binaryRaw.length === 0) {
        return { flatData, binaryData: null };
    }

    return {
        flatData,
        binaryData: buildBinaryData(
            binaryRaw,
            totalVerts,
            totalPaths,
            ZIncreasingDownwards,
            props
        ),
    };
}

// ---------------------------------------------------------------------------
// Section-path utilities
// ---------------------------------------------------------------------------

/** Precomputed data for projecting abscissa values onto the fence. */
type SectionIndex = { cumDist: number[]; path: Point2D[] };

function buildSectionIndex(path: Point2D[]): SectionIndex {
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

/**
 * A deck.gl {@link CompositeLayer} that renders collections of polylines
 * organised into named groups.
 *
 * **Data formats**
 *
 * Each {@link PolylineGroup} holds one or more polylines. Two formats are
 * supported for `PolylineGroup.polylines`:
 * - `Polyline[]` — per-object format; supports `id`, and per-polyline `color`,
 *   `width`, and `dashArray` overrides.
 * - {@link BinaryPolylines} — flat typed-array format; more efficient for
 *   large datasets loaded from binary sources. Group-level styling only.
 *
 * **Discontinuous polylines**
 *
 * A `Polyline.path` may be a nested {@link PolylineGroup}, making one logical
 * polyline consist of disjoint segments (e.g. a seismic horizon cut by faults).
 * All segments share the root `Polyline.id` for picking and visibility filtering.
 *
 * **Styling cascade**
 *
 * Color, width, and dash pattern are resolved per-path in this order:
 * polyline accessor → `Polyline` field → group accessor → `PolylineGroup` field
 * → layer default prop.
 *
 * **Section-view projection**
 *
 * When {@link PolylineGroupLayerProps.sectionPath} is provided, path coordinates
 * are interpreted as `[abscissa, depth]`. The layer renders two sub-layers:
 * one in abscissa/depth space for {@link SectionViewport}s, and one with
 * abscissa values projected back to world XY for 3-D viewports.
 *
 * **GPU-side visibility**
 *
 * {@link PolylineGroupLayerProps.hiddenGroups} and
 * {@link PolylineGroupLayerProps.hiddenPolylines} use `DataFilterExtension`.
 * Changing these sets triggers only a GPU attribute update; the flattened
 * data buffer is never rebuilt.
 */
export class PolylineGroupLayer extends CompositeLayer<PolylineGroupLayerProps> {
    /** @override Builds the initial flat data buffer and section index from `props.data`. */
    initializeState(): void {
        const { data, sectionPath } = this.props;
        const { flatData, binaryData } = flattenGroupData(data, this.props);
        this.setState({
            flatData,
            binaryData,
            sectionIndex: sectionPath ? buildSectionIndex(sectionPath) : null,
        });
    }

    /**
     * @override
     * Rebuilds the flat data buffer when `data` or any accessor/default prop changes.
     * Rebuilds the section index when `sectionPath` changes.
     */
    override updateState({
        props,
        oldProps,
    }: UpdateParameters<PolylineGroupLayer>): void {
        const needsRebuild =
            props.data !== oldProps.data ||
            props.getGroupColor !== oldProps.getGroupColor ||
            props.getGroupWidth !== oldProps.getGroupWidth ||
            props.getGroupDashArray !== oldProps.getGroupDashArray ||
            props.getPolylineColor !== oldProps.getPolylineColor ||
            props.getPolylineWidth !== oldProps.getPolylineWidth ||
            props.getPolylineDashArray !== oldProps.getPolylineDashArray ||
            props.getGroupPolylines !== oldProps.getGroupPolylines ||
            props.getPolylinePath !== oldProps.getPolylinePath ||
            props.defaultGroupColor !== oldProps.defaultGroupColor ||
            props.defaultGroupWidth !== oldProps.defaultGroupWidth ||
            props.defaultGroupDashArray !== oldProps.defaultGroupDashArray ||
            props.ZIncreasingDownwards !== oldProps.ZIncreasingDownwards;

        if (needsRebuild) {
            const { flatData, binaryData } = flattenGroupData(
                props.data,
                props
            );
            this.setState({ flatData, binaryData });
        }
        if (props.sectionPath !== oldProps.sectionPath) {
            this.setState({
                sectionIndex: props.sectionPath
                    ? buildSectionIndex(props.sectionPath)
                    : null,
            });
        }
    }

    /**
     * @override
     * Routes the `paths-section` sub-layer to {@link SectionViewport}s and
     * the `paths-3d` sub-layer to all other viewports.
     * Only active when `sectionPath` is set; otherwise the single `paths` sub-layer
     * is always visible.
     */
    override filterSubLayer({ layer, viewport }: FilterContext): boolean {
        const isSV = viewport.constructor === SectionViewport;
        if (layer.id.endsWith("-paths-section")) return isSV;
        if (layer.id.endsWith("-paths-3d")) return !isSV;
        return true;
    }

    /**
     * @override
     * Returns one or more `PathLayer` sub-layers.
     * - Without `sectionPath`: a single `paths` sub-layer for non-binary groups,
     *   plus one `paths-binary-{i}` sub-layer per binary group (typed arrays
     *   passed straight to the GPU).
     * - With `sectionPath`: a `paths-section` sub-layer (abscissa/depth space)
     *   and a `paths-3d` sub-layer (world XY space), routed by {@link filterSubLayer}.
     *   Binary groups are not supported in section mode and are skipped with a warning.
     */
    override renderLayers(): PathLayer[] {
        const flatData = this.state["flatData"] as FlatEntry[];
        const binaryData = this.state["binaryData"] as BinaryData | null;
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
            highPrecisionDash,
        } = this.props;

        // Shared sub-layer props for the non-binary `paths` sub-layer (and the
        // section-mode sub-layers).
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
                new PathStyleExtension({
                    dash: true,
                    highPrecisionDash: highPrecisionDash ?? false,
                }),
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

        const layers: PathLayer[] = [];

        if (sectionIndex) {
            if (binaryData) {
                console.warn(
                    "PolylineGroupLayer: BinaryPolylines are not supported when sectionPath is set; skipping binary groups."
                );
            }
            // Two separate sub-layers — one per coordinate system — so each has
            // its own GPU attribute buffer. filterSubLayer() routes each to the
            // appropriate viewport type (SectionViewport vs. 3D).
            const sectionUpdateTriggers = {
                ...updateTriggers,
                getPath: [...updateTriggers.getPath, sectionIndex],
            };
            layers.push(
                new PathLayer(
                    this.getSubLayerProps({
                        ...sharedProps,
                        id: "paths-section",
                        getPath: (d: FlatEntry) =>
                            d.path.map((pt) => {
                                const z = ZIncreasingDownwards ? -pt[1] : pt[1];
                                return [pt[0], z, 0];
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
                                return [wx, wy, z];
                            }),
                        updateTriggers: sectionUpdateTriggers,
                    })
                )
            );
            return layers;
        }

        if (flatData.length > 0) {
            layers.push(
                new PathLayer(
                    this.getSubLayerProps({
                        ...sharedProps,
                        id: "paths",
                        getPath: (d: FlatEntry) => {
                            if (!ZIncreasingDownwards) return d.path;
                            return d.path.map(([x, y, z]) => [x, y, -(z ?? 0)]);
                        },
                        updateTriggers,
                    })
                )
            );
        }

        if (binaryData) {
            // Build the per-vertex filter buffer. Cheap to rebuild (one float
            // per vertex) and only runs when `hiddenGroups` actually changes
            // because of the updateTriggers reference.
            const filterValues = new Float32Array(
                binaryData.vertexGroupIndex.length
            );
            for (let i = 0; i < filterValues.length; i++) {
                const g = binaryData.groups[binaryData.vertexGroupIndex[i]];
                filterValues[i] =
                    g.id != null && hiddenGroups?.has(g.id) ? 0 : 1;
            }

            // Build attributes object, omitting color/width if not present
            const attributes: { [key: string]: unknown } = {
                getPath: {
                    value: binaryData.positions,
                    size: 3,
                },
                getFilterValue: {
                    value: filterValues,
                    size: 1,
                },
            };
            attributes["getColor"] = {
                value: binaryData.colors,
                size: 4,
                normalized: true,
            };
            attributes["getWidth"] = {
                value: binaryData.widths,
                size: 1,
            };

            layers.push(
                new PathLayer(
                    this.getSubLayerProps({
                        id: "paths-binary",
                        ...sharedProps,
                        extensions: [
                            new DataFilterExtension({ filterSize: 1 }),
                        ],
                        data: {
                            length: binaryData.startIndices.length - 1, // was: .length
                            startIndices: binaryData.startIndices,
                            attributes,
                        },
                        _pathType: "open",
                        updateTriggers: {
                            getFilterValue: [hiddenGroups],
                        },
                        getColor: undefined, // color comes from attribute
                        getWidth: undefined, // width comes from attribute
                    })
                )
            );
        }

        return layers;
    }

    /**
     * @override
     * Enriches the pick result with the originating {@link PolylineGroup} (`info.group`),
     * the root {@link Polyline} (`info.object`), and layer properties for display
     * (group name, polyline id, depth at the picked coordinate).
     */
    override getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (info.index < 0) return info;

        // Resolve the source group/polyline. For Polyline[] groups the picked
        // FlatEntry carries them directly. For BinaryPolylines the sub-layer id
        // (`paths-binary-{i}`) is used to look up the source group; the polyline
        // is unavailable.
        let pickedGroup: PolylineGroup | undefined;
        let pickedPolyline: Polyline | undefined;
        let pickedSource: FlatEntry | PolylineGroup | undefined;

        const entry = info.object as FlatEntry | undefined;
        if (entry && entry._group) {
            pickedGroup = entry._group;
            pickedPolyline = entry._polyline;
            pickedSource = entry;
        } else {
            const sourceId = (
                info as PickingInfo & { sourceLayer?: { id: string } }
            ).sourceLayer?.id;
            // Robust check: deck.gl may prefix/suffix the sub-layer id.
            if (sourceId && sourceId.indexOf("paths-binary") !== -1) {
                const binaryData = this.state[
                    "binaryData"
                ] as BinaryData | null;
                const group = binaryData?.pathGroup[info.index];
                if (group) {
                    pickedGroup = group;
                    pickedSource = group;
                }
            }
        }

        if (!pickedSource) return info;

        const layerProperties: PropertyDataType[] = [];

        if (pickedGroup?.name) {
            layerProperties.push(createPropertyData("Group", pickedGroup.name));
        }
        if (pickedPolyline?.id != null) {
            layerProperties.push(
                createPropertyData("Polyline", String(pickedPolyline.id))
            );
        }

        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;
        // Omit Depth property when the pick originated from a SectionView.
        const viewport = (info as PickingInfo & { viewport?: unknown })
            .viewport;
        const isSectionView = viewport?.constructor === SectionViewport;
        if (!isSectionView && typeof info.coordinate?.[2] !== "undefined") {
            const depth =
                (this.props.ZIncreasingDownwards
                    ? -info.coordinate[2]
                    : info.coordinate[2]) / Math.max(0.001, zScale);
            layerProperties.push(createPropertyData("Depth", depth));
        }

        return {
            ...info,
            // Expose the original polyline (when available) and group for
            // onHover/onClick handlers. For binary groups `object` falls back
            // to the BinaryGroupEntry so consumers always receive something stable.
            object: pickedPolyline ?? pickedSource,
            // @ts-expect-error -- deck.gl PickingInfo doesn't type extra fields; consumers can cast
            group: pickedGroup,
            properties: layerProperties,
        };
    }
}

PolylineGroupLayer.layerName = "PolylineGroupLayer";
PolylineGroupLayer.defaultProps = defaultProps;
