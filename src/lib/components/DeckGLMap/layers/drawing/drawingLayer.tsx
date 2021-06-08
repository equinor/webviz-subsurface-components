import { CompositeLayer } from "deck.gl";
import { CompositeLayerProps } from "@deck.gl/core/lib/composite-layer";
import {
    ViewMode,
    DrawPointMode,
    DrawLineStringMode,
    DrawPolygonMode,
} from "@nebula.gl/edit-modes";

import { FeatureCollection } from "geojson";

import { EditableGeoJsonLayer } from "@nebula.gl/layers";

import { COORDINATE_SYSTEM } from "@deck.gl/core";

import { patchLayerProps } from "../utils/layerTools";

// Mapping of mode name to mode class
const MODE_MAP = {
    view: ViewMode,
    drawPoint: DrawPointMode,
    drawLineString: DrawLineStringMode,
    drawPolygon: DrawPolygonMode,
};

const defaultProps = {
    pickable: true,
    mode: "drawLineString",
    data: {
        type: "FeatureCollection",
        features: [],
    },
};

export interface DrawingLayerProps<D> extends CompositeLayerProps<D> {
    mode: string;
}

export default class DrawingLayer extends CompositeLayer<
    FeatureCollection,
    DrawingLayerProps<FeatureCollection>
> {
    initializeState(): void {
        super.initializeState();

        this.setState({
            selectedFeatureIndexes: [],
        });
    }

    renderLayers(): [EditableGeoJsonLayer] {
        return [
            new EditableGeoJsonLayer(
                this.getSubLayerProps({
                    id: "editable",
                    data: this.props.data,
                    mode: MODE_MAP[this.props.mode],
                    selectedFeatureIndexes: this.state.selectedFeatureIndexes,
                    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                    onEdit: ({ updatedData, editType }) => {
                        if (editType === "addFeature" && this.props.id) {
                            patchLayerProps<
                                DrawingLayer,
                                DrawingLayerProps<FeatureCollection>
                            >(this, {
                                ...this.props,
                                data: updatedData,
                            });
                        }
                    },
                })
            ),
        ];
    }
}

DrawingLayer.layerName = "DrawingLayer";
DrawingLayer.defaultProps = defaultProps;
