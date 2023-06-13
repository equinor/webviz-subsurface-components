import { CompositeLayer, PickingInfo, LayersList } from "@deck.gl/core/typed";
import { FeatureCollection } from "@nebula.gl/edit-modes";
import { SelectionLayer } from "@nebula.gl/layers";
import { GeoJsonLayer } from "@deck.gl/layers/typed";
import { ExtendedLayerProps } from "../utils/layerTools";
import { getSize } from "../wells/wellsLayer";
import { Color } from "@deck.gl/core/typed";
import { Feature } from "geojson";

// This should be fixed at some point
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PickInfo = any;

export interface BoxSelectionLayerProps<D> extends ExtendedLayerProps<D> {
    mode: string; // One of modes in MODE_MAP
    selectedFeatureIndexes: number[];
    pickingInfos: PickingInfo[];
    refine: boolean;
    pointRadiusScale: number;
    lineWidthScale: number;
    lineStyle: LineStyleAccessor;
    wellHeadStyle: WellHeadStyleAccessor;
    handleSelection: (pickingInfos: PickInfo[]) => void;
}

const defaultProps = {
    "@@type": "BoxSelectionLayer",
    name: "boxSelection",
    id: "boxSelection-layer",
    pickable: true,
    visible: true,

    // Props used to get/set data in the box selection layer.
    selectedFeatureIndexes: [] as number[],
    data: {
        type: "FeatureCollection",
        features: [],
    },
};

type StyleAccessorFunction = (
    object: Feature,
    objectInfo?: Record<string, unknown>
) => StyleData;

type NumberPair = [number, number];
type DashAccessor = boolean | NumberPair | StyleAccessorFunction | undefined;
type ColorAccessor = Color | StyleAccessorFunction | undefined;
type SizeAccessor = number | StyleAccessorFunction | undefined;
type StyleData = NumberPair | Color | number;

type LineStyleAccessor = {
    color?: ColorAccessor;
    dash?: DashAccessor;
    width?: SizeAccessor;
};

type WellHeadStyleAccessor = {
    color?: ColorAccessor;
    size?: SizeAccessor;
};

// Composite layer that contains an Selection Lyaer from nebula.gl
// See https://nebula.gl/docs/api-reference/layers/selection-layer
export default class BoxSelectionLayer extends CompositeLayer<
    BoxSelectionLayerProps<FeatureCollection>
> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setMultiSelection(pickingInfos: any[]): void {
        if (this.internalState) {
            const data = pickingInfos
                .map((item) => item.object)
                .filter((item) => item.type === "Feature");
            this.setState({
                pickingInfos: pickingInfos,
                data: data,
            });
        }
    }

    renderLayers(): LayersList {
        if (this.props.visible == false) {
            return [];
        }

        const LINE = "line";
        const POINT = "point";
        const isOrthographic =
            this.context.viewport.constructor.name === "OrthographicViewport";
        const positionFormat = isOrthographic ? "XY" : "XYZ";
        const geoJsonLayer = new GeoJsonLayer({
            id: "geoJson",
            data: this.state["data"],
            pickable: false,
            stroked: false,
            positionFormat,
            pointRadiusUnits: "pixels",
            lineWidthUnits: "pixels",
            pointRadiusScale: this.props.pointRadiusScale
                ? this.props.pointRadiusScale
                : 1,
            lineWidthScale: this.props.lineWidthScale
                ? this.props.lineWidthScale
                : 1,
            getLineWidth: getSize(LINE, this.props.lineStyle?.width, -1),
            getPointRadius: getSize(POINT, this.props.wellHeadStyle?.size, 2),
            getFillColor: [255, 140, 0],
            getLineColor: [255, 140, 0],
        });
        const selectionLayer = new SelectionLayer(
            // @ts-expect-error: EditableGeoJsonLayer from nebula.gl has no typing
            this.getSubLayerProps({
                id: "selection",
                selectionType: "rectangle",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onSelect: ({ pickingInfos }: any) => {
                    this.setMultiSelection(pickingInfos);
                    if (this.props.handleSelection) {
                        this.props.handleSelection(pickingInfos);
                    }
                },
                layerIds: ["wells-layer"],
                getTentativeFillColor: () => [255, 0, 255, 100],
                getTentativeLineColor: () => [0, 0, 255, 255],
                getTentativeLineDashArray: () => [0, 0],
                lineWidthMinPixels: 3,
            })
        );
        // @ts-expect-error: EditableGeoJsonLayer from nebula.gl has no typing
        return [selectionLayer, geoJsonLayer];
    }
}

BoxSelectionLayer.layerName = "BoxSelectionLayer";
BoxSelectionLayer.defaultProps =
    defaultProps as unknown as BoxSelectionLayerProps<FeatureCollection>;
