import type { Color, PickingInfo, UpdateParameters } from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import { PathLayer } from "@deck.gl/layers";
import { isEqual } from "lodash";

import type {
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../utils/layerTools";
import { createPropertyData } from "../utils/layerTools";

// ---------------------------------------------------------------------------
// Public data types
// ---------------------------------------------------------------------------

export type Position = [number, number, number];

export type Polyline = {
    id?: string | number;
    path: Position[];
    color?: Color;
    width?: number;
};

export type PolylineGroup = {
    id?: string | number;
    name?: string;
    color?: Color;
    width?: number;
    polylines: Polyline[];
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

    /** Extract the polyline list from a group object. Defaults to `g.polylines`. */
    getGroupPolylines?: (group: PolylineGroup) => Polyline[];
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
}

// ---------------------------------------------------------------------------
// Internal flat entry (what PathLayer sees)
// ---------------------------------------------------------------------------

type FlatEntry = {
    path: Position[];
    color: Color;
    width: number;
    _polyline: Polyline;
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
    getGroupPolylines: (g: PolylineGroup) => g.polylines,
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

function flattenGroupData(
    data: PolylineGroup[],
    props: PolylineGroupLayerProps
): FlatEntry[] {
    const getPolylines = props.getGroupPolylines ?? ((g) => g.polylines);
    const getPath = props.getPolylinePath ?? ((p) => p.path);
    const result: FlatEntry[] = [];

    for (const group of data) {
        const polylines = getPolylines(group);
        for (const polyline of polylines) {
            result.push({
                path: getPath(polyline, group),
                color: resolveColor(polyline, group, props),
                width: resolveWidth(polyline, group, props),
                _polyline: polyline,
                _group: group,
            });
        }
    }
    return result;
}

// ---------------------------------------------------------------------------
// Layer class
// ---------------------------------------------------------------------------

export default class PolylineGroupLayer extends CompositeLayer<PolylineGroupLayerProps> {
    initializeState(): void {
        this.setState({
            flatData: flattenGroupData(this.props.data, this.props),
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
    }

    renderLayers(): PathLayer[] {
        const flatData = this.state["flatData"] as FlatEntry[];
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
        } = this.props;

        const layer = new PathLayer(
            this.getSubLayerProps({
                id: "paths",
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
                getPath: (d: FlatEntry) => {
                    if (!ZIncreasingDownwards) return d.path;
                    return d.path.map(([x, y, z]) => [x, y, -z] as Position);
                },
                getColor: (d: FlatEntry) => d.color,
                getWidth: (d: FlatEntry) => d.width,
                updateTriggers: {
                    getPath: [ZIncreasingDownwards],
                    getColor: [flatData],
                    getWidth: [flatData],
                },
            })
        );

        return [layer];
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
