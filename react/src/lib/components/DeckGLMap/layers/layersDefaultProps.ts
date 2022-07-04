export const layersDefaultProps: Record<string, unknown> = {
    ColormapLayer: {
        "@@type": "ColormapLayer",
        name: "Property map",
        id: "colormap-layer",
        pickable: true,
        visible: true,
        valueRange: { type: "array", value: [0, 1] },
        colorMapRange: { type: "array" },
        valueDecoder: {
            rgbScaler: [1, 1, 1],
            // By default, scale the [0, 256*256*256-1] decoded values to [0, 1]
            floatScaler: 1.0 / (256.0 * 256.0 * 256.0 - 1.0),
            offset: 0,
            step: 0,
        },
        rotDeg: 0,
        colorMapName: "Rainbow",
    },
    Hillshading2DLayer: {
        "@@type": "Hillshading2DLayer",
        name: "Hill shading",
        id: "hillshading-layer",
        opacity: 1.0,
        pickable: true,
        visible: true,
        rotDeg: 0,
        valueRange: { type: "array", value: [0, 1] },
        lightDirection: [1, 1, 1],
        ambientLightIntensity: 0.5,
        diffuseLightIntensity: 0.5,
        valueDecoder: {
            rgbScaler: [1, 1, 1],
            // By default, scale the [0, 256*256*256-1] decoded values to [0, 1]
            floatScaler: 1.0 / (256.0 * 256.0 * 256.0 - 1.0),
            offset: 0,
            step: 0,
        },
    },
    MapLayer: {
        "@@type": "MapLayer",
        name: "Map",
        id: "map3d-layer-float32",
        pickable: true,
        visible: true,
        // Url for the height field.
        meshUrl: "",
        // Mesh error in meters. The output mesh is in higher resolution (more vertices) if the error is smaller.
        meshMaxError: { type: "number", value: 5 },
        // Url to the properties. (ex, poro or perm values)
        propertiesUrl: "",
        bounds: { type: "object", value: null, false: true, compare: true },
        colorMapRange: { type: "array" },
        contours: [-1.0, -1.0],
        enableSmoothShading: true,
    },

    Map3DLayer: {
        "@@type": "Map3DLayer",
        name: "Map 3D",
        id: "map3d-layer",
        pickable: true,
        visible: true,
        // Url to png image for height field.
        mesh: "",
        meshValueRange: { type: "array", value: [0, 1] },
        // Mesh error in meters. The output mesh is in higher resolution (more vertices) if the error is smaller.
        meshMaxError: { type: "number", value: 5 },
        // Url to png image for map properties. (ex, poro or perm values as a texture)
        propertyTexture: "",
        propertyValueRange: { type: "array", value: [0, 1] },
        contours: [-1.0, -1.0],
        // If contour lines should follow depth or properties.
        isContoursDepth: true,
        enableSmoothShading: true,
        material: true,
    },
    GridLayer: {
        "@@type": "GridLayer",
        id: "grid-layer",
        name: "Grid",
        pickable: true,
        valueRange: { type: "array", value: [0, 1] },
        colorMapRange: { type: "array", value: [0, 1] },
        material: true,
    },
    WellsLayer: {
        "@@type": "WellsLayer",
        name: "Wells",
        id: "wells-layer",
        autoHighlight: true,
        opacity: 1,
        lineWidthScale: 1,
        pointRadiusScale: 8,
        style: { dash: false },
        outline: true,
        logRadius: 10,
        logCurves: true,
        refine: true,
        visible: true,
        wellNameVisible: false,
        wellNameAtTop: false,
        wellNameSize: 14,
        wellNameColor: [0, 0, 0, 255],
        selectedWell: "@@#editedData.selectedWells", // used to get data from deckgl layer
    },
    FaultPolygonsLayer: {
        "@@type": "FaultPolygonsLayer",
        name: "Fault polygons",
        id: "fault-polygons-layer",
        pickable: true,
        visible: true,
        filled: true,
        lineWidthMinPixels: 2,
    },
    PieChartLayer: {
        "@@type": "PieChartLayer",
        name: "Pie chart",
        id: "pie-layer",
        pickable: true,
        visible: true,
        selectedPie: "@@editedData.selectedPie", // used to get data from deckgl layer
    },
    AxesLayer: {
        "@@type": "AxesLayer",
        name: "Axes",
        id: "axes-layer",
        visible: true,
    },
    NorthArrow3DLayer: {
        "@@type": "NorthArrow3DLayer",
        name: "NorthArrow3D",
        id: "north-arrow-layer",
        visible: true,
    },
    DrawingLayer: {
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
    },
};
