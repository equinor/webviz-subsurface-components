import type {
    Accessor,
    Color,
    GetPickingInfoParams,
    Layer,
    LayerData,
    LayerDataSource,
    LayersList,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import type { GeoJsonLayerProps } from "@deck.gl/layers";
import { PathLayer } from "@deck.gl/layers";
import type { Position } from "geojson";
import _ from "lodash";

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

/** A marker that exists somewhere along a trajectory path */
export type TrajectoryMarker = {
    type: MarkerType;
    /* The marker's position along the path, as a float between 0-1 */
    positionAlongPath: number;
    properties?: Record<string, unknown>;
};

type MarkerData = {
    type: MarkerType;
    position: Position;
    angle: number;
    positionAlongPath: number;
    properties?: Record<string, unknown>;
};

type GroupedMarkerData = {
    properties?: Record<string, unknown>;
    markers: MarkerData[];
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
        // Since some markers (for instance perforation) are visibly disconnected shapes, we need to add an intermediate data list to group related path data objects; this also lets us make auto-highlighting work per "grouped marker" (such as both perforation spikes being colored when you hover one of them)
        flattenedMarkerData: MarkerData[];
        groupedMarkerData: GroupedMarkerData[];
    };

    updateState({ changeFlags }: UpdateParameters<this>): void {
        if (!this.isLoaded) return;

        const data = this.props.data as LayerData<TData>;

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

        const flattenedMarkerData: MarkerData[] = [];
        const groupedMarkerData: GroupedMarkerData[] = [];

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

                const markerGroup: GroupedMarkerData = {
                    properties,
                    markers: [],
                };

                const markerData: MarkerData = this.getSubLayerRow(
                    {
                        type: type,
                        position: worldPosition,
                        angle: angle,
                        positionAlongPath: posFragment,
                        properties: properties,
                    },
                    markerGroup,
                    groupedMarkerData.length - 1
                );

                markerGroup.markers.push(markerData);
                flattenedMarkerData.push(markerData);

                // ! We want to show perforations as a spike on both sides of the line. Since they will rendered as disconnected lines, we need to inject a second, rotated row for it
                if (type === "perforation") {
                    const markerData2 = this.getSubLayerRow(
                        {
                            ...markerData,
                            angle: angle + Math.PI,
                        },
                        markerGroup,
                        groupedMarkerData.length - 1
                    );

                    markerGroup.markers.push(markerData2);
                    flattenedMarkerData.push(markerData2);
                }

                groupedMarkerData.push(
                    this.getSubLayerRow(markerGroup, datum, index)
                );
            }
        }

        this.setState({ flattenedMarkerData });
    }

    getPickingInfo({ info }: GetPickingInfoParams): LayerPickInfo<TData> {
        if (!info.picked || !info.object || !info.coordinate) return info;

        const object = info.object as MarkerData;

        info.coordinate[2] = object.position[2];

        const markerData = info.object as MarkerData;
        if (info.index === -1 || !markerData?.properties) return info;

        if (markerData.type !== "perforation") return info;

        return {
            ...info,
            properties: [
                {
                    name: String(markerData.properties["name"]),
                    value: String(markerData.properties["status"]),
                },
            ],
        };
    }

    // This one does look a bit weird, but since we have the intermediate layer that wraps grouped elements, we need to apply the accessor helper twice every time to get the source feature
    getNestedSubLayerAccessor<In, Out>(
        accessor: Accessor<In, Out>
    ): Accessor<In, Out> {
        return this.getSubLayerAccessor(this.getSubLayerAccessor(accessor));
    }

    renderLayers(): Layer | null | LayersList {
        // TODO: Distinct layers based on 2D or 3D views, as they should render completely differently based on context
        // TODO: Better scaling for markers. For instance, a screen marker should always be the same amount bigger than it's parent line

        return new PathLayer({
            ...this.getSubLayerProps({
                ...this.props,
                id: "-2d",
                updateTriggers: {
                    getPath: this.props.updateTriggers?.["getTrajectoryPath"],
                },
            }),
            data: this.state.flattenedMarkerData,

            getPath: (d: MarkerData) =>
                buildMarkerPath(d.type, d.position, d.angle),

            getColor: this.props.getLineColor
                ? this.getNestedSubLayerAccessor(this.props.getLineColor)
                : this.props.getMarkerColor,
            billboard: this.props.lineBillboard,

            getWidth: this.getNestedSubLayerAccessor(this.props.getLineWidth),
            widthScale: this.props.lineWidthScale,
            widthUnits: this.props.lineWidthUnits,
        });
    }
}
