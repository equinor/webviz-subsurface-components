import type {
    Accessor,
    AccessorContext,
    Color,
    FilterContext,
    GetPickingInfoParams,
    Layer,
    LayerData,
    LayerDataSource,
    LayersList,
    PickingInfo,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import type { DataFilterExtensionProps } from "@deck.gl/extensions";
import { DataFilterExtension } from "@deck.gl/extensions";
import type { GeoJsonLayerProps } from "@deck.gl/layers";
import { PathLayer, PolygonLayer } from "@deck.gl/layers";
import { GL } from "@luma.gl/constants";
import type { Position } from "geojson";
import _ from "lodash";

import { blendColors } from "../../../utils/Color";
import type { LayerPickInfo } from "../../utils/layerTools";
import {
    getFromAccessor,
    hasUpdateTriggerChanged,
} from "../../utils/layerTools";
import { getSize, LINE } from "../utils/features";
import type { MarkerType } from "../utils/markers";
import { buildMarkerPath } from "../utils/markers";
import {
    getCumulativeDistance,
    getFractionPositionSegmentIndices,
    getPositionAndAngleOnTrajectoryPath,
} from "../utils/trajectory";

export enum SubLayerId {
    MARKERS_2D = "markers-2d",
    MARKERS_2D_OUTLINE = "markers-2d--outline",
    MARKERS_2D_PICKING = "markers-2d--picking",
}

/** A marker that exists somewhere along a trajectory path */
export type TrajectoryMarker = {
    type: MarkerType;
    /* The marker's position along the path, as a float between 0-1 */
    positionAlongPath: number;
    properties?: Record<string, unknown>;
};

export type MarkerData<TData = unknown> = {
    type: MarkerType;
    position: Position;
    angle: number;
    positionAlongPath: number;
    properties?: Record<string, unknown>;

    // Internals
    sourceObject: TData;
    sourceIndex: number;
    markerIndex: number;
};

export type TrajectoryMarkerLayerProps<TData> = {
    data: LayerDataSource<TData>;
    outline: boolean;
    getTrajectoryPath: Accessor<TData, Position[]>;
    getCumulativePathDistance: Accessor<TData, number[]>;
    getMarkers: Accessor<TData, TrajectoryMarker[]>;
    getMarkerColor: Accessor<TrajectoryMarker, Color>;
};

// Although this layer only renders a path layer, we inherit props from GeoJson to make it easier to use within the WellsLayer. Future updates might include other types of markers (polygons, icons, etc) so the other properties might be relevant down the line.
type InheritedGeoJsonProps = Omit<GeoJsonLayerProps, "data" | "getFillColor">;

/**
 * Wells sub-layer for displaying different markers along a well trajectories
 * *Note:* Currently only supports markers in 2D
 */
export class TrajectoryMarkersLayer<TData = unknown> extends CompositeLayer<
    TrajectoryMarkerLayerProps<TData> & InheritedGeoJsonProps
> {
    static layerName = "TrajectoryMarkersLayer";
    static defaultProps = {
        getMarkers: { type: "accessor", value: [] },
        getMarkerColor: { type: "accessor", value: [0, 0, 0] },
        getCumulativePathDistance: { type: "accessor", value: undefined },
    };

    state!: {
        markers: MarkerData<TData>[];

        // We want to allow picking specific markers, so we cant use normal auto-highlight
        // since we'll be dealing with different indices.
        highlightedSourceIndex: number;
        hoveredMarkerIndex: number;

        cumulativePathDistanceCache: Map<number, number[]>;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
        super(...args);

        this.getMarkerColor = this.getMarkerColor.bind(this);
    }

    updateState({
        changeFlags,
        props,
        oldProps,
    }: UpdateParameters<this>): void {
        if (!this.isLoaded) return;

        const data = this.props.data as LayerData<TData>;

        if (props.highlightedObjectIndex !== oldProps.highlightedObjectIndex) {
            this.setState({
                highlightedSourceIndex: props.highlightedObjectIndex,
            });
        }

        const markersUpdate = hasUpdateTriggerChanged(
            changeFlags,
            "getMarkers"
        );

        const trajectoryUpdate = hasUpdateTriggerChanged(
            changeFlags,
            "getTrajectoryPath"
        );

        const cumulativeDistanceUpdate = hasUpdateTriggerChanged(
            changeFlags,
            "getCumulativePathDistance"
        );

        if (
            !changeFlags.dataChanged &&
            !markersUpdate &&
            !trajectoryUpdate &&
            !cumulativeDistanceUpdate
        )
            return;
        if (!this.props.getTrajectoryPath) return;
        if (!Array.isArray(data))
            throw Error(
                `Expected data to be a list, instead got ${typeof data}`
            );

        const cumulativePathDistanceCache =
            this.state.cumulativePathDistanceCache ?? new Map();

        const markers: MarkerData<TData>[] = [];

        let markerDataOffset: number = 0;

        for (let index = 0; index < data.length; index++) {
            const itemContext = { data, index, target: [] };
            const datum = data[index];

            const trajectoryPath = getFromAccessor(
                this.props.getTrajectoryPath,
                datum,
                itemContext
            );

            if (cumulativeDistanceUpdate || changeFlags.dataChanged) {
                const cumulativeDistance =
                    getFromAccessor(
                        props.getCumulativePathDistance,
                        datum,
                        itemContext
                    ) ?? getCumulativeDistance(trajectoryPath)!;

                cumulativePathDistanceCache.set(index, cumulativeDistance);
            }

            const cumulativePathDistance =
                cumulativePathDistanceCache.get(index)!;

            const trajectoryMarkers = getFromAccessor(
                this.props.getMarkers,
                datum,
                itemContext
            );

            for (
                let markerIndex = 0;
                markerIndex < trajectoryMarkers.length;
                markerIndex++
            ) {
                const { type, positionAlongPath, properties } =
                    trajectoryMarkers[markerIndex];

                const posFragment = _.clamp(positionAlongPath, 0, 1);
                const [angle, worldPosition] =
                    getPositionAndAngleOnTrajectoryPath(
                        posFragment,
                        trajectoryPath,
                        cumulativePathDistance,

                        // We'll disregard 3D positioning here; the markers look nicer when they're "flat"
                        undefined,
                        false
                    );

                const markerData: MarkerData<TData> = {
                    type: type,
                    position: worldPosition,
                    angle: angle,
                    positionAlongPath: posFragment,
                    properties: properties,
                    // Link source data
                    sourceObject: datum,
                    sourceIndex: index,
                    markerIndex: markerIndex + markerDataOffset,
                };

                markers.push(markerData);

                // ! We want to show perforations as a spike on both sides of the line. Since they will rendered as disconnected lines, we need to inject a second, rotated row for it
                if (type === "perforation") {
                    const markerData2 = {
                        ...markerData,
                        angle: angle + Math.PI,
                    };

                    markers.push(markerData2);
                }
            }

            markerDataOffset += trajectoryMarkers.length;
        }

        this.setState({ markers, cumulativePathDistanceCache });
    }

    filterSubLayer(context: FilterContext): boolean {
        if (
            context.layer.id ===
            this.getSubLayerProps({ id: SubLayerId.MARKERS_2D_PICKING }).id
        ) {
            return context.isPicking;
        }

        return true;
    }

    getPickingInfo({ info }: GetPickingInfoParams): LayerPickInfo<TData> {
        const hoveredIndex = info.object?.markerIndex ?? -1;

        this.setState({ hoveredMarkerIndex: hoveredIndex });

        return info;
    }

    updateAutoHighlight(info: PickingInfo): void {
        if (info.sourceLayer !== this && this.props.autoHighlight) {
            // Assume this is from the source
            this.setState({ highlightedSourceIndex: info.index });
        }
    }

    // We've done our own style of binding, so we override the base one to reflect that.
    protected getSubLayerAccessor<In, Out, TAccessor = Accessor<In, Out>>(
        accessor: TAccessor
    ): TAccessor {
        if (typeof accessor === "function") {
            const objectInfo: AccessorContext<In> = {
                index: -1,
                // @ts-expect-error (TS2322) -- Accessing resolved data
                data: this.props.data,
                target: [],
            };
            // @ts-expect-error (TS2416) -- deck.gl types these with In as the source data, which is technically wrong, so we ignore this error
            return (x: MarkerData<TData>) => {
                objectInfo.index = x.sourceIndex;
                // @ts-expect-error (TS2349) -- Out is never a function
                return accessor(x.sourceObject as In, objectInfo);
            };
        }

        return accessor;
    }

    private getMarkerColor(
        d: MarkerData<TData>,
        ctx: AccessorContext<MarkerData>
    ) {
        const markerIndex = d.markerIndex;

        // Check if this marker or any related marker is being hovered
        const isHighlighted =
            this.props.autoHighlight &&
            (markerIndex === this.state.hoveredMarkerIndex ||
                d.sourceIndex === this.state.highlightedSourceIndex);

        // Get base color
        let baseColor: Color;

        if (this.props.getLineColor) {
            baseColor = getFromAccessor(
                this.props.getLineColor,
                // @ts-expect-error -- accessors are hard :O
                d.sourceObject,
                ctx
            ) as Color;
        } else {
            baseColor = getFromAccessor(
                this.props.getMarkerColor,
                d,
                ctx
            ) as Color;
        }

        if (!isHighlighted) {
            return baseColor;
        }

        // Mimic auto-highlight behaviour
        let highlightColor: Color;

        if (typeof this.props.highlightColor === "function") {
            console.warn(
                "highlightColor from function is not supported in TrajectoryMarkersLayer"
            );
            highlightColor = [0, 0, 128, 128];
        } else {
            highlightColor = this.props.highlightColor as Color;
        }

        return blendColors(baseColor, highlightColor);
    }

    renderLayers(): Layer | null | LayersList {
        const { cumulativePathDistanceCache } = this.state;

        const lineWidthAccessor = this.getSubLayerAccessor(
            this.props.getLineWidth
        );

        const sourceFilterAccessor = this.getSubLayerAccessor(
            (this.props as DataFilterExtensionProps).getFilterValue
        );

        const markerFilterAccessor = (
            d: MarkerData,
            ctx: AccessorContext<MarkerData>
        ) => {
            const sourcePathDistance = cumulativePathDistanceCache.get(
                d.sourceIndex
            )!;
            const sourceFilterValue = getFromAccessor(
                sourceFilterAccessor,
                d,
                ctx
            );

            return getMarkerFilterValue(
                d,
                sourceFilterValue,
                sourcePathDistance
            );
        };

        const sharedSubLayerProps = {
            ...this.props,

            data: this.state.markers,
            billboard: this.props.lineBillboard,
            widthScale: this.props.lineWidthScale,
            widthUnits: this.props.lineWidthUnits,

            getWidth: lineWidthAccessor,

            getPath: (d: MarkerData) =>
                buildMarkerPath(d.type, d.position, d.angle),

            updateTriggers: {
                getPath: this.props.updateTriggers?.["getTrajectoryPath"],
                getColor: [
                    this.state.hoveredMarkerIndex,
                    this.state.highlightedSourceIndex,
                    this.props.getLineColor,
                    this.props.getMarkerColor,
                ],
            },
        };

        // TODO: Distinct layers based on 2D or 3D views, as they should render completely differently based on context
        // TODO: Better scaling for markers. For instance, a screen marker should always be the same amount bigger than it's parent line

        return [
            new PathLayer({
                ...this.getSubLayerProps({
                    ...sharedSubLayerProps,
                    id: SubLayerId.MARKERS_2D_OUTLINE,
                    parameters: {
                        [GL.POLYGON_OFFSET_FACTOR]: 1,
                        [GL.POLYGON_OFFSET_UNITS]: 1,
                    },
                }),

                visible: this.props.outline,
                getColor: [0, 0, 0],
                getWidth: getSize(LINE, lineWidthAccessor, 1),

                // Disable this layer for picking, instead using MARKERS_2D_PICKING
                pickable: false,
                autoHighlight: false,
                highlightedObjectIndex: -1,

                getFilterValue: markerFilterAccessor,
            }),
            new PathLayer({
                ...this.getSubLayerProps({
                    ...sharedSubLayerProps,
                    id: SubLayerId.MARKERS_2D,
                    updateTriggers: {
                        getPath:
                            this.props.updateTriggers?.["getTrajectoryPath"],
                        getColor: [
                            this.state.hoveredMarkerIndex,
                            this.state.highlightedSourceIndex,
                            this.props.getLineColor,
                            this.props.getMarkerColor,
                        ],
                    },
                }),
                getColor: this.getMarkerColor,

                getFilterValue: markerFilterAccessor,

                // Disable this layer for picking, instead using MARKERS_2D_PICKING
                pickable: false,
                autoHighlight: false,
                highlightedObjectIndex: -1,
            }),

            // To make markers easier to pick, we render them as filled polygons whilst picking
            new PolygonLayer({
                ...this.getSubLayerProps({
                    ...sharedSubLayerProps,
                    id: SubLayerId.MARKERS_2D_PICKING,
                    updateTriggers: {
                        getPolygon:
                            this.props.updateTriggers?.["getTrajectoryPath"],
                    },
                }),
                visible: this.props.pickable,
                filled: true,
                stroked: true,

                // Only render pick-able markers
                extensions: [
                    ...this.props.extensions,
                    new DataFilterExtension({ categorySize: 1 }),
                ],
                getFilterValue: markerFilterAccessor,
                getFilterCategory: (d: MarkerData) =>
                    Number(d.type !== "perforation"),

                getPolygon: (d: MarkerData) =>
                    buildMarkerPath(d.type, d.position, d.angle),

                getLineWidth: lineWidthAccessor,
                lineWidthScale: this.props.lineWidthScale,
                lineWidthUnits: this.props.lineWidthUnits,

                // Disable auto-highlight, since we've implemented it manually
                autoHighlight: false,
                highlightedObjectIndex: -1,
            }),
        ];
    }
}

function getMarkerFilterValue(
    markerData: MarkerData,
    sourceFilterValue: undefined | number | number[],
    cumulativePathDistance: number[]
) {
    if (!Array.isArray(sourceFilterValue)) return sourceFilterValue ?? 1;

    const [lowerIndex] = getFractionPositionSegmentIndices(
        markerData.positionAlongPath,
        sourceFilterValue,
        cumulativePathDistance
    );

    return sourceFilterValue[lowerIndex];
}
