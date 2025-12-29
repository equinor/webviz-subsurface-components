import type {
    Accessor,
    Color,
    Layer,
    LayerData,
    LayerDataSource,
    LayersList,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import type { GeoJsonLayerProps } from "@deck.gl/layers";
import { GeoJsonLayer } from "@deck.gl/layers";
import type { Feature, Geometry, Position } from "geojson";
import { clamp } from "lodash";

import { getFromAccessor } from "../../utils/layerTools";
import type { MarkerType } from "../utils/markers";
import { buildMarkerGeometry } from "../utils/markers";
import { getPositionAndAngleAlongTrajectoryPath } from "../utils/trajectory";

/** A marker that exists somewhere along a trajectory path */
export type TrajectoryMarker = {
    type: MarkerType;
    /* The marker's position along the path, as a float between 0-1 */
    positionAlongPath: number;
};

export type TrajectoryMarkerFeature = Feature<Geometry, TrajectoryMarker>;

export type TrajectoryMarkerLayerProps<TData> = {
    data: LayerDataSource<TData>;
    getTrajectoryPath: Accessor<TData, Position[]>;
    getMarkers: Accessor<TData, TrajectoryMarker[]>;
    getMarkerColor: Accessor<TrajectoryMarker, Color>;
};

type InheritedGeoJsonProps = Omit<
    GeoJsonLayerProps,
    "data" | "getLineColor" | "getFillColor"
>;

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
    };

    state!: {
        markerFeatures2D: TrajectoryMarkerFeature[];
    };

    updateState({ changeFlags }: UpdateParameters<this>): void {
        const data = this.props.data as LayerData<TData>;
        const markersUpdate =
            changeFlags.updateTriggersChanged &&
            !!changeFlags.updateTriggersChanged["getMarkers"];

        if (!this.isLoaded) return;
        if (!changeFlags.dataChanged && !markersUpdate) return;
        if (!Array.isArray(data))
            throw Error(
                `Expected data to be a list, instead got ${typeof data}`
            );

        const markerFeatures2D: TrajectoryMarkerFeature[] = [];

        for (let index = 0; index < data.length; index++) {
            const itemContext = { data, index, target: [] };
            const datum = data[index];

            const trajectoryPath = getFromAccessor(
                this.props.getTrajectoryPath,
                datum,
                itemContext
            );
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
                const marker = trajectoryMarkers[markerIndex];
                const posFragment = clamp(marker.positionAlongPath, 0, 1);
                const [angle, worldPosition] =
                    getPositionAndAngleAlongTrajectoryPath(
                        posFragment,
                        trajectoryPath,
                        // Arrow func to preserve "this"
                        (xyz) => this.project(xyz),
                        this.props.positionFormat === "XYZ"
                    );

                const featureGeometry = buildMarkerGeometry(
                    marker.type,
                    worldPosition,
                    angle
                );

                markerFeatures2D.push({
                    type: "Feature",
                    properties: marker,
                    geometry: featureGeometry,
                });
            }
        }

        this.setState({ markerFeatures2D });
    }

    renderLayers(): Layer | null | LayersList {
        // TODO: Distinct layers based on 2D or 3D views, as they should render completely differently based on context
        return new GeoJsonLayer({
            ...this.getSubLayerProps({
                ...this.props,
                id: "-2d",
            }),

            data: this.state.markerFeatures2D,
            positionFormat: "XY",

            lineBillboard: true,
            filled: false,

            getLineColor: this.props.getMarkerColor,
            getFillColor: [0, 0, 0, 0],
        });
    }
}
