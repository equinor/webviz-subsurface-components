import type {
    EditAction,
    Feature,
    FeatureCollection,
    GeoJsonEditMode,
    ModeProps,
} from "@deck.gl-community/editable-layers";
import {
    DrawLineStringMode,
    DrawPointMode,
    DrawPolygonMode,
    EditableGeoJsonLayer,
    ImmutableFeatureCollection,
    ModifyMode,
    TransformMode,
    ViewMode,
} from "@deck.gl-community/editable-layers";
import type {
    Color,
    LayerContext,
    LayersList,
    PickingInfo,
} from "@deck.gl/core";
import { COORDINATE_SYSTEM, CompositeLayer } from "@deck.gl/core";
import type { DeckGLLayerContext } from "../../components/Map";
import { area, length } from "../../utils/measurement";
import type { ExtendedLayerProps, LayerPickInfo } from "../utils/layerTools";

// Custom drawing mode that deletes the selected GeoJson feature when releasing the Delete key.
class CustomModifyMode extends ModifyMode {
    handleKeyUp(event: KeyboardEvent, props: ModeProps<FeatureCollection>) {
        super.handleKeyUp(event, props);

        if (event.key === "Delete") {
            const updatedData = new ImmutableFeatureCollection(props.data)
                .deleteFeatures(props.selectedIndexes)
                .getObject();

            if (updatedData) {
                props.onEdit({
                    updatedData,
                    editType: "removeFeature",
                    editContext: {
                        featureIndexes: props.selectedIndexes,
                    },
                });
            }
        }
    }
}

function deleteEscapeKeyHandler(
    drawMode: GeoJsonEditMode,
    event: KeyboardEvent,
    props: ModeProps<FeatureCollection>
) {
    if (event.key === "Escape") drawMode.getClickSequence().pop();
    else if (event.key === "Delete") drawMode.resetClickSequence();
    else return;

    // used to set state so layer can be rerendered
    const updatedData = new ImmutableFeatureCollection(props.data).getObject();
    if (updatedData) {
        props.onEdit({
            updatedData,
            editType: "undoDrawing",
            editContext: {
                featureIndexes: props.selectedIndexes,
            },
        });
    }
}

class CustomDrawLineStringMode extends DrawLineStringMode {
    handleKeyUp(event: KeyboardEvent, props: ModeProps<FeatureCollection>) {
        super.handleKeyUp(event, props);
        deleteEscapeKeyHandler(this, event, props);
    }
}

class CustomDrawPolygonMode extends DrawPolygonMode {
    handleKeyUp(event: KeyboardEvent, props: ModeProps<FeatureCollection>) {
        super.handleKeyUp(event, props);
        deleteEscapeKeyHandler(this, event, props);
    }
}

// Mapping of mode name to mode class
const MODE_MAP = {
    view: ViewMode,
    modify: CustomModifyMode,
    transform: TransformMode,
    drawPoint: DrawPointMode,
    drawLineString: CustomDrawLineStringMode,
    drawPolygon: CustomDrawPolygonMode,
};

const UNSELECTED_LINE_COLOR: Color = [0x50, 0x50, 0x50, 0xcc];
const SELECTED_LINE_COLOR: Color = [0x0, 0x0, 0x0, 0xff];

export interface DrawingLayerProps extends ExtendedLayerProps {
    mode: string; // One of modes in MODE_MAP
    selectedFeatureIndexes: number[];
}

const defaultProps = {
    "@@type": "DrawingLayer",
    name: "Drawing",
    id: "drawing-layer",
    pickable: true,
    visible: true,
    mode: "drawLineString",

    // Props used to get/set data in the drawing layer.
    selectedFeatureIndexes: [] as number[],
    data: {
        type: "FeatureCollection",
        features: [],
    },
};

// Composite layer that contains an EditableGeoJsonLayer from nebula.gl
// See https://nebula.gl/docs/api-reference/layers/editable-geojson-layer
export default class DrawingLayer extends CompositeLayer<DrawingLayerProps> {
    initializeState(context: LayerContext): void {
        super.initializeState(context);

        this.setState({
            data: this.props.data,
            selectedFeatureIndexes: this.props.selectedFeatureIndexes,
        });
    }

    // Select features when clicking on them if in view or modify modes.
    // The selection is used to set current selected drawing, and
    // is sent to the map component parent via setEditedData.
    onClick(info: PickingInfo): boolean {
        if (this.props.mode === "view" || this.props.mode === "modify") {
            this.setState({
                selectedFeatureIndexes: [info.index],
            });
            (this.context as DeckGLLayerContext).userData.setEditedData({
                selectedFeatureIndexes: [info.index],
            });
            return true;
        }

        return false;
    }

    // For now, use `any` for the picking types because this function should
    // recieve PickInfo<FeatureCollection>, but it recieves PickInfo<Feature>.
    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (!info.object) return info;
        const feature = info.object;
        let measurement;
        if (feature.geometry?.type === "LineString") {
            measurement = length(feature);
        } else if (feature.geometry?.type === "Polygon") {
            measurement = area(feature);
        } else return info;
        return {
            ...info,
            propertyValue: measurement,
        };
    }

    // Callback for various editing events. Most events will update this component
    // through patches sent to the map parent. See patchLayerPropsin layerTools.ts.
    _onEdit(editAction: EditAction<FeatureCollection>): void {
        switch (editAction.editType) {
            case "addFeature":
                this.setState({
                    data: editAction.updatedData,
                    selectedFeatureIndexes:
                        editAction.editContext.featureIndexes,
                });
                (this.context as DeckGLLayerContext).userData.setEditedData({
                    data: editAction.updatedData,
                    selectedFeatureIndexes:
                        editAction.editContext.featureIndexes,
                });
                break;
            case "removeFeature":
                this.setState({
                    data: editAction.updatedData,
                    selectedFeatureIndexes: [],
                });
                (this.context as DeckGLLayerContext).userData.setEditedData({
                    data: editAction.updatedData,
                    selectedFeatureIndexes: [] as number[],
                });
                break;
            case "removePosition":
            case "finishMovePosition":
                this.setState({
                    data: editAction.updatedData,
                });
                (this.context as DeckGLLayerContext).userData.setEditedData({
                    data: editAction.updatedData,
                });
                break;
            case "movePosition":
            case "undoDrawing":
                // Don't use setEditedData to avoid an expensive roundtrip,
                // since this is done on every mouse move when editing.
                this.setState({ data: editAction.updatedData });
                break;
        }
    }

    // Return the line color based on the selection status.
    // The same can be done for other features (polygons, points etc).
    _getLineColor(feature: Feature): Color {
        const selectedFeatureIndexes = this.state[
            "selectedFeatureIndexes"
        ] as number[];
        const data = this.state["data"] as FeatureCollection;
        const is_feature_selected = selectedFeatureIndexes.some(
            (i: number) => (data.features[i] as unknown as Feature) === feature
        );
        if (is_feature_selected) {
            return SELECTED_LINE_COLOR;
        } else {
            return UNSELECTED_LINE_COLOR;
        }
    }

    renderLayers(): LayersList {
        if (this.props.visible == false) {
            return [];
        }
        const sub_layer_props = this.getSubLayerProps({
            data: this.state["data"],
            mode: MODE_MAP[this.props.mode as keyof typeof MODE_MAP],
            modeConfig: {
                viewport: this.context.viewport,
            },
            selectedFeatureIndexes: this.state["selectedFeatureIndexes"],
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            onEdit: (editAction: EditAction<FeatureCollection>) =>
                this._onEdit(editAction),
            _subLayerProps: {
                geojson: {
                    autoHighlight: true,
                    getLineColor: (feature: Feature) =>
                        this._getLineColor(feature),
                },
            },
        });

        return [new EditableGeoJsonLayer(sub_layer_props)];
    }
}

DrawingLayer.layerName = "DrawingLayer";
DrawingLayer.defaultProps = defaultProps as unknown as DrawingLayerProps;
