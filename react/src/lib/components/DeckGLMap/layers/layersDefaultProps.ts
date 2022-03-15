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
        colorMapRange: { type: "array", value: [0, 1] },
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
        // Url to png image for height field.
        mesh: "",
        // Mesh error in meters. The output mesh is in higher resolution (more vertices) if the error is smaller.
        meshMaxError: { type: "number", value: 5 },
        // Url to png image for map properties. (ex, poro or perm values as a texture)
        propertyTexture: "",
        // Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates
        bounds: { type: "array", value: null, false: true, compare: true },
        colorMapRange: { type: "array" },
        rotDeg: 0,
        contours: [-1.0, -1.0],
        // readout is default property value but if set to true it will be depth/z-value.
        isReadoutDepth: true,
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
        // Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates
        bounds: { type: "array", value: null, false: true, compare: true },
        propertyValueRange: { type: "array", value: [0, 1] },
        rotDeg: 0,
        contours: [-1.0, -1.0],
        // If contour lines should follow depth or properties.
        isContoursDepth: true,
        // readout is default property value but if set to true it will be depth/z-value.
        isReadoutDepth: false,
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
    },
    WellsLayer: {
        "@@type": "WellsLayer",
        name: "Wells",
        id: "wells-layer",
        autoHighlight: true,
        opacity: 1,
        lineWidthScale: 5,
        pointRadiusScale: 8,
        outline: true,
        logRadius: 6,
        logCurves: true,
        refine: true,
        visible: true,
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
