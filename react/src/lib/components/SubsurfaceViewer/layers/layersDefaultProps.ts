export const layersDefaultProps: Record<string, unknown> = {

    WellsLayer: {
        "@@type": "WellsLayer",
        name: "Wells",
        id: "wells-layer",
        autoHighlight: true,
        opacity: 1,
        lineWidthScale: 1,
        pointRadiusScale: 1,
        lineStyle: { dash: false },
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
        depthTest: true,
    },
    FaultPolygonsLayer: {
        "@@type": "FaultPolygonsLayer",
        name: "Fault polygons",
        id: "fault-polygons-layer",
        pickable: true,
        visible: true,
        filled: true,
        lineWidthMinPixels: 2,
        depthTest: true,
    },
    PieChartLayer: {
        "@@type": "PieChartLayer",
        name: "Pie chart",
        id: "pie-layer",
        pickable: true,
        visible: true,
        selectedPie: "@@editedData.selectedPie", // used to get data from deckgl layer
        depthTest: true,
    },
    AxesLayer: {
        "@@type": "AxesLayer",
        name: "Axes",
        id: "axes-layer",
        visible: true,
    },
    Axes2DLayer: {
        "@@type": "Axes2DLayer",
        name: "Axes2D",
        id: "axes2d-layer",
        visible: true,
        marginH: 30, // Horizontal margin (in pixles)
        marginV: 30, // Vertical margin (in pixles)
    },
    NorthArrow3DLayer: {
        "@@type": "NorthArrow3DLayer",
        name: "NorthArrow3D",
        id: "north-arrow-layer",
        visible: true,
        color: [0, 0, 0, 1],
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
    BoxSelectionLayer: {
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
    },
    Grid3DLayer: {
        "@@type": "Grid3DLayer",
        name: "Grid 3D",
        id: "grid-3d-layer",
        visible: true,
        material: true,
        colorMapName: "",
        propertyValueRange: [0.0, 1.0],
        depthTest: true,
    },
};
