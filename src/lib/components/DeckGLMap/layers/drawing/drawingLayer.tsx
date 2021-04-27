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

// Mapping of mode name to mode class
const MODE_MAP = {
    view: ViewMode,
    drawPoint: DrawPointMode,
    drawLineString: DrawLineStringMode,
    drawPolygon: DrawPolygonMode,
};

const DEFAULT_EDIT_MODE = DrawLineStringMode;

const defaultProps = {
    pickable: true,
    mode: DEFAULT_EDIT_MODE,
    data: {
        type: "FeatureCollection",
        features: [],
    },
};

export interface DrawingLayerProps<D> extends CompositeLayerProps<D> {
    mode?: string;
    setLayerProps: (layerId: string, props: Record<string, unknown>) => void;
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
        const mode =
            typeof this.props.mode === "string"
                ? MODE_MAP[this.props.mode]
                : this.props.mode;

        return [
            new EditableGeoJsonLayer(
                this.getSubLayerProps({
                    id: "editable",
                    data: this.props.data,
                    mode: mode,
                    selectedFeatureIndexes: this.state.selectedFeatureIndexes,
                    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
                    onEdit: ({ updatedData, editType }) => {
                        if (editType === "addFeature" && this.props.id) {
                            this.props.setLayerProps(this.props.id, {
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
