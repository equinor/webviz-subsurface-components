import { COORDINATE_SYSTEM, RGBAColor } from "@deck.gl/core";
import { UpdateStateInfo } from "@deck.gl/core/lib/layer";
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
import { patchLayerProps } from "../utils/layerTools";

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

const defaultProps = {
    name: "Drawing",
    pickable: true,
    mode: "drawLineString",

    // Props mainly used to make the information available to the Map parent comp.
    selectedFeatureIndexes: [],
    data: {
        type: "FeatureCollection",
        features: [],
    },
};

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
    updateState(
        info: UpdateStateInfo<DrawingLayerProps<FeatureCollection>>
    ): void {
        super.updateState(info);

        if (info.changeFlags.dataChanged) {
            this.setState({
                data: this.props.data,
            });
        }
    }

    // Select features when clicking on them if in view or modify modes.
    // The selection is sent to the map component parent as a patch.
    onClick(info: PickInfo<FeatureCollection>): boolean {
        if (this.props.mode === "view" || this.props.mode === "modify") {
            const featureIndex = this.state.data.features.indexOf(info.object);
            if (featureIndex >= 0) {
                patchLayerProps<FeatureCollection>(this, {
                    ...this.props,
                    selectedFeatureIndexes: [info.index],
                } as DrawingLayerProps<FeatureCollection>);
                return true;
            }
        }

        return false;
    }

    // Callback for various editing events. Most events will update this component
    // through patches sent to the map parent. See patchLayerPropsin layerTools.ts.
    _onEdit(editAction: EditAction<FeatureCollection>): void {
        switch (editAction.editType) {
            case "addFeature":
                patchLayerProps<FeatureCollection>(this, {
                    ...this.props,
                    data: editAction.updatedData,
                    selectedFeatureIndexes:
                        editAction.editContext.featureIndexes,
                } as DrawingLayerProps<FeatureCollection>);
                break;
            case "removeFeature":
                patchLayerProps<FeatureCollection>(this, {
                    ...this.props,
                    data: editAction.updatedData,
                    selectedFeatureIndexes: [],
                } as DrawingLayerProps<FeatureCollection>);
                break;
            case "removePosition":
            case "finishMovePosition":
                patchLayerProps<FeatureCollection>(this, {
                    ...this.props,
                    data: editAction.updatedData,
                } as DrawingLayerProps<FeatureCollection>);
                break;
            case "movePosition":
                // Don't use patchLayerProps to avoid an expensive roundtrip,
                // since this is done on every mouse move when editing.
                this.setState({ data: editAction.updatedData });
                break;
        }
    }

    // Return the line color based on the selection status.
    // The same can be done for other features (polygons, points etc).
    _getLineColor(feature: Feature): RGBAColor {
        const is_feature_selected = this.props.selectedFeatureIndexes.some(
            (i) => this.state.data.features[i] === feature
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
                    selectedFeatureIndexes: this.props.selectedFeatureIndexes,
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
DrawingLayer.defaultProps = defaultProps;
