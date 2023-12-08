import React from "react";
import type { StoryFn } from "@storybook/react";
import { styled } from "@mui/material/styles";
import type { SubsurfaceViewerProps } from "../SubsurfaceViewer";
import SubsurfaceViewer from "../SubsurfaceViewer";
import exampleData from "../../../../../example-data/deckgl-map.json";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

const PREFIX = "Default";

const classes = {
    main: `${PREFIX}-main`,
    tab: `${PREFIX}-tab`,
};

const Root = styled("div")({
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
});

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer",
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

        cameraPosition: {
            description: "Camera position to set the point of view.",
        },

        bounds: {
            description:
                "Coordinate boundary for the view defined as [left, bottom, right, top].",
        },

        triggerHome: {
            description: "Forces resetting to initial home position",
            control: {
                type: "number",
            },
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
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },
} as ComponentMeta<typeof SubsurfaceViewer>;

// Template for when edited data needs to be captured.
const EditDataTemplate = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);
    return (
        <SubsurfaceViewer
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
    return <SubsurfaceViewer {...args} />;
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
    <SubsurfaceViewer id={"deckgl-map"} bounds={[0, 0, 1, 1]} />
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

const meshMapLayerPng = {
    "@@type": "MapLayer",
    id: "mesh-layer-png",
    meshUrl: "hugin_depth_25_m.png",
    frame: {
        origin: [432150, 6475800],
        count: [291, 229],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertiesUrl: "kh_netmap_25_m.png",
    contours: [0, 100],
    isContoursDepth: true,
    gridLines: false,
    material: true,
    smoothShading: true,
    colorMapName: "Physics",
};

const axes2D = {
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
            <SubsurfaceViewer
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

export const MapInContainer = (args) => {
    return (
        <Root className={classes.main}>
            <SubsurfaceViewer {...args} />
        </Root>
    );
};

MapInContainer.args = {
    ...exampleData[0],
};

export const ViewMatrixMargin: StoryFn<typeof SubsurfaceViewer> = (args) => {
    const props = {
        ...args,
    };

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
            </div>
        </Root>
    );
};

ViewMatrixMargin.args = {
    id: "DeckGL-Map",
    layers: [meshMapLayerPng, axes2D],
    bounds: [432150, 6475800, 439400, 6481501],
    views: {
        layout: [2, 2],
        marginPixels: 10,
        showLabel: true,
        viewports: [
            {
                id: "view_1",
                show3D: false,
                layerIds: ["mesh-layer-png", "axes-layer"],
                isSync: true,
            },
            {
                id: "view_2",
                show3D: false,
                layerIds: ["mesh-layer-png", "axes-layer"],
                isSync: true,
            },
            {
                id: "view_3",
                show3D: false,
                layerIds: ["mesh-layer-png", "axes-layer"],
                isSync: false,
            },
            {
                id: "view_4",
                show3D: false,
                layerIds: ["mesh-layer-png", "axes-layer"],
                isSync: false,
            },
        ],
    },
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    renderHiddenTabs: boolean;
}

const CustomTabPanel: React.FC<TabPanelProps> = (props: TabPanelProps) => {
    const { children, value, index, renderHiddenTabs, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {(value === index || renderHiddenTabs) && (
                <Box sx={{ p: 3 }}>{children}</Box>
            )}
        </div>
    );
};

const a11yProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
};

const SubsurfaceWrapper: React.FC<SubsurfaceViewerProps> = (
    props: SubsurfaceViewerProps
) => {
    return (
        <div
            style={{
                height: "65vh",
                //width: "50vw",
                position: "relative",
            }}
        >
            <SubsurfaceViewer {...props} />
        </div>
    );
};

type ViewerTabsProps = SubsurfaceViewerProps & { renderHiddenTabs: boolean };

const ViewerTabs: React.FC<ViewerTabsProps> = (
    props: SubsurfaceViewerProps
) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ flexDirection: "column" }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="basic tabs example"
                    >
                        <Tab label="Tab One" {...a11yProps(0)} />
                        <Tab label="Tab Two" {...a11yProps(1)} />
                        <Tab label="Tab Three" {...a11yProps(2)} />
                    </Tabs>
                </Box>

                <Box sx={{ height: "80%" }}>
                    <CustomTabPanel
                        value={value}
                        index={0}
                        renderHiddenTabs={props.renderHiddenTabs}
                    >
                        <SubsurfaceWrapper {...props} />
                    </CustomTabPanel>
                    <CustomTabPanel
                        value={value}
                        index={1}
                        renderHiddenTabs={props.renderHiddenTabs}
                    >
                        <SubsurfaceWrapper {...props} />
                    </CustomTabPanel>
                    <CustomTabPanel
                        value={value}
                        index={2}
                        renderHiddenTabs={props.renderHiddenTabs}
                    >
                        <SubsurfaceWrapper {...props} />
                    </CustomTabPanel>
                </Box>
            </Box>
        </Box>
    );
};

export const ViewTabs: StoryFn<typeof ViewerTabs> = (args) => {
    return (
        <Root>
            <ViewerTabs {...args}></ViewerTabs>
        </Root>
    );
};

ViewTabs.args = {
    renderHiddenTabs: true,
    id: "DeckGL-Map",
    layers: [meshMapLayerPng, axes2D],
    bounds: [432150, 6475800, 439400, 6481501],
    views: {
        layout: [2, 2],
        marginPixels: 10,
        showLabel: true,
        viewports: [
            {
                id: "view_1",
                show3D: false,
                layerIds: ["mesh-layer-png", "axes-layer"],
                isSync: true,
            },
            {
                id: "view_2",
                show3D: false,
                layerIds: ["mesh-layer-png", "axes-layer"],
                isSync: true,
            },
            {
                id: "view_3",
                show3D: false,
                layerIds: ["mesh-layer-png", "axes-layer"],
                isSync: false,
            },
            {
                id: "view_4",
                show3D: false,
                layerIds: ["mesh-layer-png", "axes-layer"],
                isSync: false,
            },
        ],
    },
};
