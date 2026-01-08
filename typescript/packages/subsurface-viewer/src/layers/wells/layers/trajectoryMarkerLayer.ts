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
import { PathLayer } from "@deck.gl/layers";
import type { Feature, Geometry, Position } from "geojson";
import { clamp } from "lodash";

import { getFromAccessor } from "../../utils/layerTools";
import type { MarkerType } from "../utils/markers";
import { buildMarkerPath } from "../utils/markers";
import { getPositionAndAngleAlongTrajectoryPath } from "../utils/trajectory";

/** A marker that exists somewhere along a trajectory path */
export type TrajectoryMarker = {
    type: MarkerType;
    /* The marker's position along the path, as a float between 0-1 */
    positionAlongPath: number;
} & Record<string, unknown>;

export type TrajectoryMarkerFeature = Feature<Geometry, TrajectoryMarker>;

type MarkerData = {
    type: MarkerType;
    position: Position;
    angle: number;
};

export type TrajectoryMarkerLayerProps<TData> = {
    data: LayerDataSource<TData>;
    getTrajectoryPath: Accessor<TData, Position[]>;
    getMarkers: Accessor<TData, TrajectoryMarker[]>;
    getMarkerColor: Accessor<TrajectoryMarker, Color>;
};

// Although this layer only renders a path layer, we inherit props from GeoJson to make it easier to use within the WellsLayer. Future updates might include other types of markers (polygons, icons, etc) so the other properties might be relevant down the line.
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
        subLayerData: MarkerData[];
    };

    updateState({ changeFlags }: UpdateParameters<this>): void {
        const data = this.props.data as LayerData<TData>;
        const markersUpdate =
            changeFlags.updateTriggersChanged &&
            !!changeFlags.updateTriggersChanged["getMarkers"];

        if (!this.isLoaded) return;
        if (!changeFlags.dataChanged && !markersUpdate) return;
        if (!this.props.getTrajectoryPath) return;
        if (!Array.isArray(data))
            throw Error(
                `Expected data to be a list, instead got ${typeof data}`
            );

        const subLayerData: MarkerData[] = [];

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
                const {
                    type: markerType,
                    positionAlongPath: pathPosition,
                    ...otherData
                } = trajectoryMarkers[markerIndex];

                const posFragment = clamp(pathPosition, 0, 1);
                const [angle, worldPosition] =
                    getPositionAndAngleAlongTrajectoryPath(
                        posFragment,
                        trajectoryPath,
                        // Arrow func to preserve "this"
                        (xyz) => this.project(xyz),
                        this.props.positionFormat === "XYZ"
                    );

                const markerData = {
                    type: markerType,
                    position: worldPosition,
                    angle: angle,
                    ...otherData,
                } as MarkerData;

                subLayerData.push(
                    this.getSubLayerRow(markerData, datum, index)
                );

                // ! We want to show perforations as a spike on both sides of the line. Since they will rendered as disconnected lines, we need to inject a second, rotated row for it
                if (markerType === "perforation") {
                    const markerDatum2 = {
                        ...markerData,
                        angle: angle + Math.PI,
                    };
                    subLayerData.push(
                        this.getSubLayerRow(markerDatum2, datum, index)
                    );
                }
            }
        }

        this.setState({ subLayerData });
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

            data: this.state.subLayerData,

            getPath: (d: MarkerData) =>
                buildMarkerPath(d.type, d.position, d.angle),

            getColor: this.getSubLayerAccessor(this.props.getMarkerColor),
            billboard: this.props.lineBillboard,

            getWidth: this.getSubLayerAccessor(this.props.getLineWidth),
            widthScale: this.props.lineWidthScale,
            widthUnits: this.props.lineWidthUnits,
        });
    }
}
