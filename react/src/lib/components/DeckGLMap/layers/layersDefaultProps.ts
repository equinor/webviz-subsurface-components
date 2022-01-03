export const layersDefaultProps: Record<string, unknown> = {
    ColormapLayer: {
        name: "Property map",
        id: "colormap-layer",
        pickable: true,
        visible: true,
        colormap: { type: "object", value: null, async: true },
        valueRange: { type: "array" },
        colorMapRange: { type: "array" },
        valueDecoder: {
            rgbScaler: [1, 1, 1],
            // By default, scale the [0, 256*256*256-1] decoded values to [0, 1]
            floatScaler: 1.0 / (256.0 * 256.0 * 256.0 - 1.0),
            offset: 0,
            step: 0,
        },
        rotDeg: 0,
    },
    Hillshading2DLayer: {
        name: "Hill shading",
        id: "hillshading-layer",
        opacity: 1.0,
        pickable: true,
        visible: true,
        rotDeg: 0,
        valueRange: { type: "array" },
        colorMapRange: { type: "array" },
        lightDirection: { type: "array", value: [1, 1, 1] },
        ambientLightIntensity: { type: "number", value: 0.5 },
        diffuseLightIntensity: { type: "number", value: 0.5 },
        valueDecoder: {
            rgbScaler: [1, 1, 1],
            // By default, scale the [0, 256*256*256-1] decoded values to [0, 1]
            floatScaler: 1.0 / (256.0 * 256.0 * 256.0 - 1.0),
            offset: 0,
            step: 0,
        },
    },
    Map3DLayer: {
        name: "Map 3D",
        id: "3D-map-layer",
        pickable: true,
        visible: false,
        // Url to png image for height field.
        mesh: { type: "string", optional: false },
        // Mesh error in meters. The output mesh is in higher resolution (more vertices) if the error is smaller.
        meshMaxError: { type: "number", value: 5 },
        // Url to png image for map properties. (ex, poro or perm values as a texture)
        propertyTexture: { type: "string", optional: false },
        // Bounding box of the terrain image, [minX, minY, maxX, maxY] in world coordinates
        bounds: { type: "array", value: null, false: true, compare: true },
        valueRange: { type: "array", value: [0, 1] },
        rotDeg: 0,
        contours: [-1.0, -1.0],
    },
    GridLayer: {
        name: "Grid",
        pickable: true,
    },
    WellsLayer: {
        name: "Wells",
        id: "wells-layer",
        autoHighlight: true,
        selectionEnabled: true,
        opacity: 1,
        lineWidthScale: 5,
        pointRadiusScale: 8,
        outline: true,
        logRadius: 6,
        logCurves: true,
        refine: true,
        visible: true,
    },
    FaultPolygonsLayer: {
        name: "Fault polygons",
        id: "fault-polygons-layer",
        pickable: true,
        visible: true,
        filled: true,
        lineWidthMinPixels: 2,
    },
    PieChartLayer: {
        name: "Pie chart",
        id: "pie-layer",
        pickable: true,
        visible: true,
        selectionEnabled: true,
    },
    DrawingLayer: {
        name: "Drawing",
        id: "drawing-layer",
        pickable: true,
        visible: true,
        mode: "drawLineString",

        // Props mainly used to make the information available to the Map parent comp.
        selectedFeatureIndexes: [] as number[],
        data: {
            type: "FeatureCollection",
            features: [],
        },
    },
};
