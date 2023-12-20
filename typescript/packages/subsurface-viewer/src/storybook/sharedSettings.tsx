import React from "react";

import { styled } from "@mui/material/styles";

import type { BoundingBox2D } from "../components/Map";
import type { SubsurfaceViewerProps } from "../SubsurfaceViewer";
import SubsurfaceViewer from "../SubsurfaceViewer";
import type { BoundingBox3D } from "../utils/BoundingBox3D";

import exampleData from "../../../../../example-data/deckgl-map.json";

export const classes = {
    main: "default-main",
};

export const mainStyle = {
    [`& .${classes.main}`]: {
        width: 750,
        height: 500,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        border: "1px solid black",
        background: "azure",
        position: "absolute",
    },
};

export const Root = styled("div")(mainStyle);

// Full deckgl-map.json
export const subsufaceProps: SubsurfaceViewerProps =
    exampleData[0] as unknown as SubsurfaceViewerProps;

// Layers from deckgl-map.json
// ColormapLayer
export const colormapLayer = {
    ...exampleData[0].layers[0],
    id: "colormap-layer",
};

// Hillshading2DLayer
export const hillshadingLayer = {
    ...exampleData[0].layers[1],
    id: "hillshading-layer",
};

// Map3DLayer
export const map3DLayer = {
    ...exampleData[0].layers[2],
    id: "map3d-layer",
};

export const redAxes2DLayer = {
    "@@type": "Axes2DLayer",
    id: "axes-layer",
    marginH: 80, // Horizontal margin (in pixels)
    marginV: 30, // Vertical margin (in pixels)
    isLeftRuler: true,
    isRightRuler: false,
    isBottomRuler: true,
    isTopRuler: false,
    backgroundColor: [155, 0, 0, 255],
};

export const hugin2DOrigin: [number, number] = [432150, 6475800];
export const hugin2DBounds: BoundingBox2D = [432150, 6475800, 439400, 6481500];
export const hugin3DBounds: BoundingBox3D = [
    432150, 6475800, -2000, 439400, 6481500, -3500,
];

export const huginAxes3DLayer = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [432150, 6475800, 2000, 439400, 6481500, 3500] as BoundingBox3D,
};

export const northArrowLayer = {
    "@@type": "NorthArrow3DLayer",
    id: "north-arrow-layer",
};

export const volveWellsLayer = {
    "@@type": "WellsLayer",
    id: "volve-wells",
    data: "./volve_wells.json",
};

export const volveWellsBounds: BoundingBox2D = [
    432150, 6475800, 439400, 6481500,
];

export const volveWellsWithLogsLayer = {
    "@@type": "WellsLayer",
    id: "volve-wells-with-logs",
    data: "./volve_wells.json",
    logData: "./volve_logs.json",
    logrunName: "BLOCKING",
    logName: "ZONELOG",
    logColor: "Stratigraphy",
};

// Example using "Map" layer. Uses PNG float for mesh.
export const huginMapDepthPropLayerPng = {
    "@@type": "MapLayer",
    id: "hugin_depth",
    meshData: "hugin_depth_25_m.float32",
    frame: {
        origin: [432150, 6475800] as [number, number],
        count: [291, 229] as [number, number],
        increment: [25, 25] as [number, number],
        rotDeg: 0,
    },
    propertiesData: "hugin_depth_25_m.float32",
    contours: [0, 100] as [number, number],
    material: false,
};
export const huginMapNetmapPropLayerPng = {
    ...huginMapDepthPropLayerPng,
    id: "hugin_kh_netmap",
    propertiesData: "kh_netmap_25_m.float32",
};

// Example using "Map" layer. Uses PNG float for mesh and properties.
export const huginMeshMapLayerPng = {
    "@@type": "MapLayer",
    id: "hugin-mesh-layer",
    meshData: "hugin_depth_25_m.png",
    frame: {
        origin: [432150, 6475800],
        count: [291, 229],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertiesData: "kh_netmap_25_m.png",
    contours: [0, 100],
    isContoursDepth: true,
    gridLines: false,
    material: true,
    smoothShading: true,
    colorMapName: "Physics",
    ZIncreasingDownwards: true,
};

export const default3DViews = {
    layout: [1, 1] as [number, number],
    viewports: [
        {
            id: "view_1",
            show3D: true,
        },
    ],
};

// Data for custome geojson layer with polyline data
export const customLayerWithPolylineData = {
    "@@type": "GeoJsonLayer",
    id: "geojson-line-layer",
    name: "Line",
    data: {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: [
                        [434000, 6477500],
                        [435500, 6477500],
                    ],
                },
            },
        ],
    },
    getLineWidth: 20,
    lineWidthMinPixels: 2,
};

// Data for custom geojson layer with polygon data
export const customLayerWithPolygonData = {
    "@@type": "GeoJsonLayer",
    id: "geojson-layer",
    name: "Polygon",
    data: {
        type: "Feature",
        properties: {},
        geometry: {
            type: "Polygon",
            coordinates: [
                [
                    [434562, 6477595],
                    [434562, 6478595],
                    [435062, 6478595],
                    [435062, 6477595],
                    [434562, 6477595],
                ],
            ],
        },
    },
    getLineWidth: 20,
    lineWidthMinPixels: 2,
    getLineColor: [0, 255, 255],
    getFillColor: [0, 255, 0],
    opacity: 0.3,
};

// Data for custom text layer
export const customLayerWithTextData = {
    "@@type": "TextLayer",
    id: "text-layer",
    name: "Text",
    data: [
        {
            name: "Custom GeoJson layer",
            coordinates: [434800, 6478695],
        },
    ],
    pickable: true,
    getPosition: (d) => d.coordinates,
    getText: (d) => d.name,
    getColor: [255, 0, 0],
    getSize: 16,
    getAngle: 0,
    getTextAnchor: "middle",
    getAlignmentBaseline: "center",
};

// Template for when edited data needs to be captured.
export const EditedDataTemplate: React.FC<SubsurfaceViewerProps> = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);

    return (
        <SubsurfaceViewer
            {...args}
            editedData={editedData}
            setProps={(updatedProps) => {
                setEditedData(
                    updatedProps.editedData as Record<string, unknown>
                );
            }}
        />
    );
};
