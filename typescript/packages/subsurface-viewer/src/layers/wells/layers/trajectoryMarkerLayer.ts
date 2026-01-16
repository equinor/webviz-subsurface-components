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
import { DataFilterExtension } from "@deck.gl/extensions";
import type { GeoJsonLayerProps } from "@deck.gl/layers";
import { PathLayer, PolygonLayer } from "@deck.gl/layers";
import type { Position } from "geojson";
import _ from "lodash";

import { blendColors } from "../../../utils/Color";
import type { LayerPickInfo } from "../../utils/layerTools";
import {
    getFromAccessor,
    hasUpdateTriggerChanged,
} from "../../utils/layerTools";
import type { MarkerType } from "../utils/markers";
import { buildMarkerPath } from "../utils/markers";
import {
    getCumulativeDistance,
    getPositionAndAngleOnTrajectoryPath,
} from "../utils/trajectory";

export enum SubLayerId {
    MARKERS_2D = "markers-2d",
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

            const cumulativePathDistance =
                getFromAccessor(
                    this.props.getCumulativePathDistance,
                    datum,
                    itemContext
                ) ?? getCumulativeDistance(trajectoryPath);

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
                        // Arrow func to preserve "this"
                        (xyz) => this.project(xyz),
                        this.props.positionFormat === "XYZ"
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

        this.setState({ markers });
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

    // @ts-expect-error (TS2416) -- The base typing is technically wrong
    protected getSubLayerAccessor<In, Out>(
        accessor: Accessor<In, Out>
    ): Accessor<MarkerData<TData>, Out> {
        if (typeof accessor === "function") {
            const objectInfo: AccessorContext<In> = {
                index: -1,
                // @ts-expect-error (TS2322) -- Accessing resolved data
                data: this.props.data,
                target: [],
            };
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
        // TODO: Distinct layers based on 2D or 3D views, as they should render completely differently based on context
        // TODO: Better scaling for markers. For instance, a screen marker should always be the same amount bigger than it's parent line
        return [
            new PathLayer({
                ...this.getSubLayerProps({
                    ...this.props,
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
                data: this.state.markers,

                getPath: (d: MarkerData) =>
                    buildMarkerPath(d.type, d.position, d.angle),

                getColor: this.getMarkerColor,

                billboard: this.props.lineBillboard,
                getWidth: this.getSubLayerAccessor(this.props.getLineWidth),
                widthScale: this.props.lineWidthScale,
                widthUnits: this.props.lineWidthUnits,

                // Disable this layer for picking, instead using MARKERS_2D_PICKING
                pickable: false,
                autoHighlight: false,
                highlightedObjectIndex: -1,
            }),

            // To make markers easier to pick, we render them as filled polygons whilst picking
            new PolygonLayer({
                ...this.getSubLayerProps({
                    ...this.props,
                    id: SubLayerId.MARKERS_2D_PICKING,
                    updateTriggers: {
                        getPolygon:
                            this.props.updateTriggers?.["getTrajectoryPath"],
                    },
                }),
                data: this.state.markers,
                visible: this.props.pickable,
                filled: true,
                stroked: true,

                extensions: [new DataFilterExtension({ categorySize: 1 })],
                getFilterCategory: (d: MarkerData) =>
                    Number(d.type !== "perforation"),

                getPolygon: (d: MarkerData) =>
                    buildMarkerPath(d.type, d.position, d.angle),

                getLineColor: [255, 0, 0],
                getFillColor: [255, 0, 0],
                billboard: this.props.lineBillboard,

                getLineWidth: this.getSubLayerAccessor(this.props.getLineWidth),
                lineWidthScale: this.props.lineWidthScale,
                lineWidthUnits: this.props.lineWidthUnits,
                autoHighlight: false,
            }),
        ];
    }
}
