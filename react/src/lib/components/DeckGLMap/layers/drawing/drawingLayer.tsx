import { COORDINATE_SYSTEM, RGBAColor } from "@deck.gl/core";
import { ExtendedLayerProps } from "../utils/layerTools";
import {
    DrawLineStringMode,
    DrawPointMode,
    DrawPolygonMode,
    EditAction,
    Feature,
    FeatureCollection,
    ImmutableFeatureCollection,
    ModeProps,
    ModifyMode,
    TransformMode,
    ViewMode,
} from "@nebula.gl/edit-modes";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";
import { CompositeLayer, PickInfo } from "deck.gl";
import { layersDefaultProps } from "../layersDefaultProps";
import { DeckGLLayerContext } from "../../components/Map";

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

// Mapping of mode name to mode class
const MODE_MAP = {
    view: ViewMode,
    modify: CustomModifyMode,
    transform: TransformMode,
    drawPoint: DrawPointMode,
    drawLineString: DrawLineStringMode,
    drawPolygon: DrawPolygonMode,
};

const UNSELECTED_LINE_COLOR: RGBAColor = [0x50, 0x50, 0x50, 0xcc];
const SELECTED_LINE_COLOR: RGBAColor = [0x0, 0x0, 0x0, 0xff];

export interface DrawingLayerProps<D> extends ExtendedLayerProps<D> {
    mode: string; // One of modes in MODE_MAP
    selectedFeatureIndexes: number[];
}

// Composite layer that contains an EditableGeoJsonLayer from nebula.gl
// See https://nebula.gl/docs/api-reference/layers/editable-geojson-layer
export default class DrawingLayer extends CompositeLayer<
    FeatureCollection,
    DrawingLayerProps<FeatureCollection>
> {
    initializeState(params?: PickInfo<FeatureCollection>): void {
        super.initializeState(params);

        this.setState({
            data: this.props.data,
            selectedFeatureIndexes: this.props.selectedFeatureIndexes,
        });
    }

    // Select features when clicking on them if in view or modify modes.
    // The selection is used to set current selected drawing, and
    // is sent to the map component parent via setEditedData.
    onClick(info: PickInfo<FeatureCollection>): boolean {
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
                // Don't use setEditedData to avoid an expensive roundtrip,
                // since this is done on every mouse move when editing.
                this.setState({ data: editAction.updatedData });
                break;
        }
    }

    // Return the line color based on the selection status.
    // The same can be done for other features (polygons, points etc).
    _getLineColor(feature: Feature): RGBAColor {
        const is_feature_selected = this.state.selectedFeatureIndexes.some(
            (i: number) => this.state.data.features[i] === feature
        );
        if (is_feature_selected) {
            return SELECTED_LINE_COLOR;
        } else {
            return UNSELECTED_LINE_COLOR;
        }
    }

    renderLayers(): [EditableGeoJsonLayer?] {
        if (this.props.visible == false) {
            return [];
        }
        return [
            new EditableGeoJsonLayer(
                this.getSubLayerProps({
                    data: this.state.data,
                    mode: MODE_MAP[this.props.mode as keyof typeof MODE_MAP],
                    modeConfig: {
                        viewport: this.context.viewport,
                    },
                    selectedFeatureIndexes: this.state.selectedFeatureIndexes,
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
                })
            ),
        ];
    }
}

DrawingLayer.layerName = "DrawingLayer";
DrawingLayer.defaultProps = layersDefaultProps[
    "DrawingLayer"
] as DrawingLayerProps<FeatureCollection>;
