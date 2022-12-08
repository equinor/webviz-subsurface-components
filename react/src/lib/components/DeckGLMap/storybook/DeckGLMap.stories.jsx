import React from "react";
import DeckGLMap from "../DeckGLMap";
import exampleData from "../../../../demo/example-data/deckgl-map.json";
import { makeStyles } from "@material-ui/styles";
import {
    ColorLegend,
    colorTables,
    createColorMapFunction,
} from "@emerson-eps/color-tables";

export default {
    component: DeckGLMap,
    title: "DeckGLMap",
    argTypes: {
        id: {
            description:
                "The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app.",
        },

        resources: {
            description:
                "Resource dictionary made available in the DeckGL specification as an enum. \
            The values can be accessed like this: `@@#resources.resourceId`, where \
            `resourceId` is the key in the `resources` dict. For more information, \
            see the DeckGL documentation on enums in the json spec: \
            https://deck.gl/docs/api-reference/json/conversion-reference#enumerations-and-using-the--prefix",
        },

        layers: {
            description:
                "List of JSON object containing layer specific data. \
            Each JSON object will consist of layer type with key as `@@type` and layer specific data, if any.",
        },

        bounds: {
            description:
                "Coordinate boundary for the view defined as [left, bottom, right, top].",
        },

        zoom: {
            description: "Zoom level for the view",
        },

        views: {
            description:
                "Views configuration for map. If not specified, all the layers will be displayed in a single 2D viewport.<br/>" +
                "Options:<br/>" +
                "layout: [number, number] — Layout for viewport in specified as [row, column],<br/>" +
                "viewports: [`ViewportType`] — Layers configuration for multiple viewport,<br/><br/>" +
                "`ViewportType` options: <br/>" +
                "id: string — Viewport id <br>" +
                "name: string — Viewport name <br>" +
                "show3D: boolean — Toggle 3D view <br>" +
                "layerIds: [string] — Layer ids to be displayed on viewport.",
        },

        coords: {
            description:
                "Options for readout panel.<br/>" +
                "visible: boolean — Show/hide readout,<br/>" +
                "multipicking: boolean — Enable or disable multi picking,<br/>" +
                "pickDepth: number — Number of objects to pick.",
        },

        scale: {
            description:
                "Options for distance scale component.<br/>" +
                "visible: boolean — Show/hide scale bar,<br/>" +
                "incrementValue: number — Increment value for the scale,<br/>" +
                "widthPerUnit: number — Scale bar width in pixels per unit value,<br/>" +
                "position: [number, number] — Scale bar position in pixels.",
        },

        coordinateUnit: {
            description: "Unit for the scale ruler",
        },

        legend: {
            description:
                "Options for color legend.<br/>" +
                "visible: boolean — Show/hide color legend,<br/>" +
                "position: [number, number] — Legend position in pixels,<br/>" +
                "horizontal: boolean — Orientation of color legend.",
        },

        colorTables: {
            description:
                "Prop containing color table data." +
                "See colorTables repo for reference:<br/>" +
                "https://github.com/emerson-eps/color-tables/blob/main/react-app/dist/component/color-tables.json",
        },

        editedData: {
            description:
                "Map data returned via editedData prop.<br/>" +
                "selectedWell: string — Selected well name,<br/>" +
                "selectedPie: object — Selected pie chart data,<br/>" +
                "selectedFeatureIndexes: [number] — Drawing layer data index,<br/>" +
                "data: object — Drawing layer data, indexed from selectedFeatureIndexes.",
        },

        setProps: {
            description: "For reacting to prop changes",
        },
    },
};

// Template for when edited data needs to be captured.
const EditDataTemplate = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);
    return (
        <DeckGLMap
            {...args}
            editedData={editedData}
            setProps={(updatedProps) => {
                setEditedData(updatedProps.editedData);
            }}
        />
    );
};

// Blank template.
const MinimalTemplate = (args) => {
    return <DeckGLMap {...args} />;
};

// Data for custome geojson layer with polyline data
const customLayerWithPolylineData = {
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
const customLayerWithPolygonData = {
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
const customLayerWithTextData = {
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

// Layers data for storybook example 1
const layersData1 = [
    customLayerWithPolylineData,
    customLayerWithPolygonData,
    customLayerWithTextData,
];

// Layers data for storybook example 2
const colormapLayer = exampleData[0].layers[0];
const layersData2 = [
    colormapLayer,
    customLayerWithPolylineData,
    customLayerWithPolygonData,
    customLayerWithTextData,
];

const hillshadingLayer = exampleData[0].layers[1];

// Storybook example 1
export const Default = EditDataTemplate.bind({});
Default.args = {
    ...exampleData[0],
};

// Minimal map example.
export const Minimal = () => (
    <DeckGLMap id={"deckgl-map"} bounds={[0, 0, 1, 1]} />
);
Minimal.parameters = {
    docs: {
        description: {
            story: "An example showing the minimal required arguments, which will give an empty map viewer.",
        },
    },
};

// Volve kh netmap data, flat surface
export const KhMapFlat = MinimalTemplate.bind({});
KhMapFlat.args = {
    id: "kh-map-flat",
    resources: {
        propertyMap: "./volve_property_normalized.png",
        depthMap: "./volve_hugin_depth_normalized.png",
    },
    bounds: [432150, 6475800, 439400, 6481500],
    layers: [
        {
            "@@type": "ColormapLayer",
            id: "property_map",
            valueRange: [-3071, 41048],
            bounds: [432150, 6475800, 439400, 6481500],
            image: "@@#resources.propertyMap",
        },
        {
            ...hillshadingLayer,
            valueRange: [2725, 3397],
            bounds: [432150, 6475800, 439400, 6481500],
            opacity: 0.6,
        },
    ],
};
KhMapFlat.parameters = {
    docs: {
        description: {
            story: "An example showing a kh property layer and a depth map hillshading layer.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

// Map3DLayer. Properties encoded in RGB.
const meshMapLayer = {
    "@@type": "Map3DLayer",
    id: "mesh-layer",
    mesh: "hugin_depth_25_m_normalized_margin.png",
    meshValueRange: [2782, 3513],
    // Either "bounds" or "frame". "bounds" will be deprecated."
    //bounds: [432205, 6475078, 437701, 6480898],  // [xmin, xmax, ymin, ymax]
    frame: {
        origin: [432205, 6475078],
        count: [229, 291],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertyTexture: "kh_netmap_25_m_normalized_margin.png",
    propertyValueRange: [-3071, 41048],
    contours: [0, 100.0],
    isContoursDepth: true,
    colorMapName: "Physics",
};

export const KhMapMesh = MinimalTemplate.bind({});
KhMapMesh.args = {
    id: "kh-mesh-map",
    layers: [
        {
            ...meshMapLayer,
        },
    ],
    toolbar: {
        visible: false,
    },
    bounds: [432150, 6475800, 439400, 6481500],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
                layerIds: [],
            },
        ],
    },
};

//Material property may take these values:
//          true  = default material. See deck.gl documentation for what that is. This is default property value.
//          false = no material.
//          Full spec:
//                {
//                    ambient: 0.35,
//                    diffuse: 0.6,
//                    shininess: 32,
//                    specularColor: [255, 255, 255],
//                }
const material = {
    ambient: 0.35,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [255, 255, 255],
};
export const MapMaterial = MinimalTemplate.bind({});
MapMaterial.args = {
    id: "material",
    layers: [{ ...meshMapLayer, material }],
    bounds: [432150, 6475800, 439400, 6481500],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: false,
                layerIds: [],
            },
        ],
    },
};
MapMaterial.parameters = {
    docs: {
        description: {
            story: "An example showing example usage of Map3D material property.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

// Exapmple of using "colorMapClampColor" property.
// Clamps colormap to this color at ends.
// Given as array of three values (r,g,b) e.g: [255, 0, 0]
// If not set (undefined) or set to true, it will clamp to color map min and max values.
// If set to false the clamp color will be completely transparent.
const propertyValueRange = [2782, 3513];
const colorMapRange = [3000, 3513];
const colorMapClampColor = [0, 255, 0]; // a color e.g. [0, 255, 0],  false, true or undefined.

export const MapClampColor = MinimalTemplate.bind({});
MapClampColor.args = {
    id: "clampcolor",
    layers: [
        {
            ...meshMapLayer,
            propertyValueRange,
            colorMapRange,
            colorMapClampColor,
        },
    ],
    bounds: [432150, 6475800, 439400, 6481500],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: false,
                layerIds: [],
            },
        ],
    },
};
MapClampColor.parameters = {
    docs: {
        description: {
            story: 'An example usage of map property `"colorMapClampColor"',
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

const axes = {
    "@@type": "AxesLayer",
    id: "axes-layer",
    bounds: [432205, 6475078, -3500, 437930, 6482353, 0],
};

// Example using "colorMapFunction" property.
const layer = {
    ...meshMapLayer,
    isContoursDepth: true,
    colorMapFunction: (x) => [255 - x * 100, 255 - x * 100, 255 * x], // If defined this function will override the colormap.
};
export const colorMapFunction = MinimalTemplate.bind({});
colorMapFunction.args = {
    id: "colorMapFunction",
    layers: [
        // map layer
        layer,
        // colormap layer
        {
            ...colormapLayer,
            image: "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/propertyMap.png",
            colorMapFunction: (x) => [255 - x * 100, 255 - x * 100, 255 * x], // If defined this function will override the colormap.
        },
    ],
    bounds: [432150, 6475800, 439400, 6481500],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
                layerIds: [],
            },
        ],
    },
};

// custom layer example
export const UserDefinedLayer1 = EditDataTemplate.bind({});
UserDefinedLayer1.args = {
    id: exampleData[0].id,
    bounds: exampleData[0].bounds,
    layers: layersData1,
};

// custom layer with colormap
export const UserDefinedLayer2 = EditDataTemplate.bind({});
UserDefinedLayer2.args = {
    id: exampleData[0].id,
    resources: exampleData[0].resources,
    bounds: exampleData[0].bounds,
    layers: layersData2,
};

// multiple synced view
export const MultiView = EditDataTemplate.bind({});
MultiView.args = {
    ...exampleData[0],
    legend: {
        visible: false,
    },
    layers: [
        ...exampleData[0].layers,
        customLayerWithPolylineData,
        customLayerWithPolygonData,
        customLayerWithTextData,
    ],
    views: {
        layout: [2, 2],
        showLabel: true,
        viewports: [
            {
                id: "view_1",
                name: "Colormap layer",
                show3D: false,
                layerIds: ["colormap-layer"],
                zoom: -5,
                isSync: true,
            },
            {
                id: "view_2",
                name: "Hill-shading layer",
                show3D: false,
                layerIds: ["hillshading-layer"],
                zoom: -5,
                isSync: true,
            },
            {
                id: "view_3",
                name: "All layers",
                show3D: false,
                layerIds: [],
                zoom: -5,
                isSync: false,
            },
            {
                id: "view_4",
                name: "Custom layer",
                show3D: false,
                layerIds: ["geojson-line-layer", "geojson-layer", "text-layer"],
                zoom: -5,
                isSync: false,
            },
        ],
    },
};

// ---------Selectable GeoJson Layer example--------------- //
export const SelectableFeatureExample = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);
    return (
        <div>
            <DeckGLMap
                {...args}
                editedData={editedData}
                setProps={(updatedProps) => {
                    setEditedData(updatedProps.editedData);
                }}
            />
            <pre>{JSON.stringify(editedData, null, 2)}</pre>
        </div>
    );
};

SelectableFeatureExample.parameters = {
    docs: {
        description: {
            story: "An example showing selectable feature example from the map.",
        },
    },
};

const polylineUsingSelectableGeoJsonLayer = {
    ...customLayerWithPolylineData,
    "@@type": "SelectableGeoJsonLayer",
};

const polygonUsingSelectableGeoJsonLayer = {
    ...customLayerWithPolygonData,
    "@@type": "SelectableGeoJsonLayer",
};

SelectableFeatureExample.args = {
    id: "DeckGL-Map",
    bounds: [432205, 6475078, 437720, 6481113],
    layers: [
        polylineUsingSelectableGeoJsonLayer,
        polygonUsingSelectableGeoJsonLayer,
    ],
};

// Map used inside a div container template
const useStyles = makeStyles({
    main: {
        width: 500,
        height: 500,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        border: "1px solid black",
        background: "azure",
        position: "absolute",
    },
});

export const MapInContainer = (args) => {
    const classes = useStyles();
    return (
        <div className={classes.main}>
            <DeckGLMap {...args} />
        </div>
    );
};

MapInContainer.args = {
    ...exampleData[0],
};

// ColormapLayer with color selector component
const defaultProps = {
    id: "DeckGlMap",
    resources: {
        propertyMap:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/propertyMap.png",
    },
    bounds: [432150, 6475800, 439400, 6481500],
};

const layers = [
    {
        "@@type": "ColormapLayer",
        image: "@@#resources.propertyMap",
        rotDeg: 0,
        bounds: [432205, 6475078, 437720, 6481113],
        valueRange: [2782, 3513],
        colorMapRange: [2782, 3513],
    },
];

const mapDataTemplate = (args) => {
    const [getColorName, setColorName] = React.useState("Rainbow");
    const [colorRange, setRange] = React.useState();
    const [isAuto, setAuto] = React.useState();
    const [setBreakPoint] = React.useState();
    const [isLog, setIsLog] = React.useState(false);
    const [isNearest, setIsNearest] = React.useState(false);

    // user defined breakpoint(domain)
    const userDefinedBreakPoint = React.useCallback((data) => {
        if (data) setBreakPoint(data);
    }, []);

    // Get selected legend color name from color selector
    const colorNameFromSelector = React.useCallback((data) => {
        setColorName(data);
    }, []);

    // user defined range
    const userDefinedRange = React.useCallback((data) => {
        if (data.range) setRange(data.range);
        setAuto(data.isAuto);
    }, []);

    // interpolation method
    const getInterpolateMethod = React.useCallback((data) => {
        setIsLog(data.isLog);
        setIsNearest(data.isNearest);
    }, []);

    const colorMapFunc = React.useCallback(() => {
        return createColorMapFunction(getColorName, isLog, isNearest);
    }, [isLog, isNearest, getColorName]);

    const updatedLayerData = [
        {
            ...args.layers[0],
            colorMapName: getColorName,
            colorMapRange:
                colorRange && isAuto == false
                    ? colorRange
                    : layers[0].colorMapRange,
            colorMapFunction: colorMapFunc(),
        },
    ];
    return (
        <div>
            <div
                style={{
                    float: "right",
                    zIndex: 999,
                    opacity: 1,
                    position: "relative",
                }}
            >
                <ColorLegend
                    {...args}
                    colorName={getColorName}
                    getColorName={colorNameFromSelector}
                    getColorRange={userDefinedRange}
                    getBreakpointValue={userDefinedBreakPoint}
                    getInterpolateMethod={getInterpolateMethod}
                />
            </div>
            <DeckGLMap {...args} layers={updatedLayerData} />
        </div>
    );
};

export const ColorMapLayerColorSelector = mapDataTemplate.bind({});

ColorMapLayerColorSelector.args = {
    min: layers[0].colorMapRange[0],
    max: layers[0].colorMapRange[1],
    dataObjectName: "ColorMap Legend",
    position: [16, 10],
    horizontal: true,
    colorTables,
    layers,
    zoom: -5,
    ...defaultProps,
    legend: {
        visible: false,
    },
    reverseRange: false,
};

ColorMapLayerColorSelector.parameters = {
    docs: {
        description: {
            story: "Clicking on legend opens(toggle) the color selector component and then click on the color scale to update the layer.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
