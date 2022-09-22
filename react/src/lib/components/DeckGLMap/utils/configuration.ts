// This configuration object determines which deck.gl classes are accessible in the serialized json
// See https://deck.gl/docs/api-reference/json/overview for more details.

import {
    COORDINATE_SYSTEM,
    FirstPersonView,
    MapView,
    OrbitView,
    OrthographicView,
} from "@deck.gl/core/typed";

import * as AggregationLayers from "@deck.gl/aggregation-layers/typed";
import * as GeoLayers from "@deck.gl/geo-layers/typed";
import * as Layers from "@deck.gl/layers/typed";
import * as MeshLayers from "@deck.gl/mesh-layers/typed";
import { EditableGeoJsonLayer } from "@nebula.gl/layers";

import { registerLoaders } from "@loaders.gl/core";
import GL from "@luma.gl/constants";

import * as CustomLayers from "../layers";
import * as CustomViews from "../views";

// Note: deck already registers JSONLoader...
registerLoaders([]);

export default {
    // Classes that should be instantiatable by JSON converter
    classes: Object.assign(
        // Support `@deck.gl/core` Views
        {
            FirstPersonView,
            MapView,
            OrbitView,
            OrthographicView,
            ...CustomViews,
        },

        // a map of all layers that should be exposes as JSONLayers
        Layers,
        AggregationLayers,
        GeoLayers,
        MeshLayers,
        CustomLayers,
        // Any non-standard views or layers
        { EditableGeoJsonLayer }
    ),

    // Functions that should be executed by JSON converter
    functions: {},

    // Enumerations that should be available to JSON parser
    // Will be resolved as `<enum-name>.<enum-value>`
    enumerations: {
        COORDINATE_SYSTEM,
        GL,
    },

    // Constants that should be resolved with the provided values by JSON converter
    constants: {},
};
