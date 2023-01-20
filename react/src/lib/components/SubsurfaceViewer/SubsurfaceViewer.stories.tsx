import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { format } from "d3-format";
import { PickingInfo } from "@deck.gl/core/typed";
import { ContinuousLegend } from "@emerson-eps/color-tables";
import SubsurfaceViewer from "./SubsurfaceViewer";
import {
    TooltipCallback,
    LayerPickInfo,
    WellsPickInfo,
    ExtendedLayerProps,
    PropertyDataType,
    FeatureCollection,
    ViewFooter,
    View,
} from "../..";
import { ViewStateType, ViewsType } from "./components/Map";
import {
    createColorMapFunction,
    ColorLegend,
    colorTables,
} from "@emerson-eps/color-tables";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer",
} as ComponentMeta<typeof SubsurfaceViewer>;

const defaultWellsLayer = {
    "@@type": "WellsLayer",
    data: "@@#resources.wellsData",
};

const defaultProps = {
    id: "volve-wells",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432150, 6475800, 439400, 6481500] as [
        number,
        number,
        number,
        number
    ],
    layers: [defaultWellsLayer],
};

const Template: ComponentStory<typeof SubsurfaceViewer> = (args) => (
    <SubsurfaceViewer {...args} />
);

function mdTooltip(info: PickingInfo) {
    if (!info.picked) return null;
    const value = (info as WellsPickInfo)?.properties?.[0].value;
    if (!value) return null;
    const f = format(".2f");
    const niceValue = f(+value);
    return "MD: " + niceValue;
}

export const TooltipApi = Template.bind({});
TooltipApi.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultWellsLayer,
            lineStyle: { width: 7 },
        },
    ],
    getTooltip: mdTooltip,
    bounds: [433000, 6476000, 439000, 6480000],
};

TooltipApi.parameters = {
    docs: {
        description: {
            story: "Example of overriding the default tooltip, showing measured depth (MD) instead of the default bahaviour, which is to show the well name.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const TooltipStyle = Template.bind({});

const processPropInfo = (
    properties: PropertyDataType[] | undefined,
    filter: string[] | boolean
): string => {
    if (!properties) {
        return "";
    }

    let outputString = "";

    if (typeof filter == "boolean") {
        if (filter) {
            properties.forEach((ppobj) => {
                outputString += `\n${ppobj["name"]} : ${ppobj["value"]}`;
            });
        }
    } else {
        // filter is not boolean - thus it is a string array and we should check each property
        properties.forEach((ppobj) => {
            if (filter.includes(ppobj["name"] as string)) {
                outputString += `\n${ppobj["name"]} : ${ppobj["value"]}`;
            }
        });
    }
    return outputString;
};

const tooltipImpFunc: TooltipCallback = (
    info: PickingInfo
): Record<string, unknown> | string | null => {
    if (!info.picked || !info.layer) {
        return null;
    }
    const outputObject: Record<string, unknown> = {};
    const layerName = info.layer.constructor.name;
    let outputString = "";
    if (layerName === "Map3DLayer") {
        const layerProps = info.layer
            .props as unknown as ExtendedLayerProps<unknown>;
        const layerName = layerProps.name;
        const properties = (info as LayerPickInfo).properties;
        outputString += `Property: ${layerName}`;
        outputString += processPropInfo(properties, true);
    } else if (layerName === "WellsLayer") {
        const wellsPickInfo = info as WellsPickInfo;
        const wellsPickInfoObject = info.object as FeatureCollection;
        const wellProperties = wellsPickInfoObject.properties;
        const name = (wellProperties as { name: string }).name;
        outputString += `Well: ${name || ""}`;
        if (wellsPickInfo.featureType !== "points") {
            outputString += processPropInfo(wellsPickInfo.properties, true);
        }
    }
    outputObject["text"] = outputString;
    outputObject["style"] = { color: "yellow" };
    return outputObject;
};

TooltipStyle.args = {
    ...defaultProps,
    layers: [
        {
            ...defaultWellsLayer,
            lineStyle: { width: 7 },
        },
    ],
    getTooltip: tooltipImpFunc,
    bounds: [433000, 6476000, 439000, 6480000],
};

TooltipStyle.parameters = {
    docs: {
        description: {
            story: "Example of overriding tooltip style.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

const CustomTemplate: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    const [state, setState] = React.useState(args.cameraPosition);

    const getCameraPosition = React.useCallback((input: ViewStateType) => {
        setState(input);
        return input;
    }, []);
    return (
        <>
            <SubsurfaceViewer
                {...args}
                cameraPosition={args.cameraPosition}
                getCameraPosition={getCameraPosition}
            />
            <div
                style={{
                    position: "absolute",
                    marginLeft: 200,
                }}
            >
                <div>zoom: {state?.zoom}</div>
                <div>rotationX: {state?.rotationX}</div>
                <div>rotationOrbit: {state?.rotationOrbit}</div>
                <div>targetX: {state?.target[0]}</div>
                <div>targetY: {state?.target[1]}</div>
            </div>
        </>
    );
};

export const customizedCameraPosition = CustomTemplate.bind({});

const cameraPosition: ViewStateType = {
    target: [437500, 6475000],
    zoom: -5.0,
    rotationX: 90,
    rotationOrbit: 0,
};

customizedCameraPosition.args = {
    ...defaultProps,
    cameraPosition,
};

const mapLayer = {
    "@@type": "MapLayer",
    id: "hugin",
    meshUrl: "hugin_depth_25_m.float32",
    frame: {
        origin: [432150, 6475800],
        count: [291, 229],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertiesUrl: "kh_netmap_25_m.float32",
    contours: [0, 100],
    material: false,
};

const MultiViewAnnotationTemplate: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => (
    <SubsurfaceViewer {...args}>
        {
            <View id="view_1">
                <ContinuousLegend min={-3071} max={41048} />
                <ViewFooter>kH netmap</ViewFooter>
            </View>
        }
        {
            <View id="view_2">
                <ContinuousLegend min={2725} max={3396} />
                <ViewFooter>Hugin</ViewFooter>
            </View>
        }
    </SubsurfaceViewer>
);

export const MultiViewAnnotation = MultiViewAnnotationTemplate.bind({});

MultiViewAnnotation.args = {
    id: "multi_view_annotation",
    layers: [
        mapLayer,
        {
            ...mapLayer,
            id: "kh_netmap",
            propertiesUrl: "hugin_depth_25_m.float32",
        },
    ],
    views: {
        layout: [1, 2],
        showLabel: true,
        viewports: [
            {
                id: "view_1",
                layerIds: ["hugin"],
            },
            {
                id: "view_2",
                layerIds: ["kh_netmap"],
            },
        ],
    },
};

export const ViewObjectInitializedAsEmpty = MultiViewAnnotationTemplate.bind(
    {}
);

ViewObjectInitializedAsEmpty.args = {
    id: "view_initialized_as_empty",
    layers: [
        mapLayer,
        {
            ...mapLayer,
            id: "kh_netmap",
            propertiesUrl: "hugin_depth_25_m.float32",
        },
    ],
    views: {} as ViewsType,
};

const wellsLayerNoDepthTest = {
    ...defaultWellsLayer,
    id: "wells-layer-no-depth-test",
    depthTest: false,
};

export const DepthTest: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    const props = {
        ...args,
        layers: [mapLayer, defaultWellsLayer, wellsLayerNoDepthTest],
    };

    return (
        <>
            <div>
                <SubsurfaceViewer {...props} />
            </div>
            <h4>
                View on the right depthTest for the wells layer property is set
                to false and wells layer is given last so that it will be
                painted on top. On the left parts of the wells are hidden
                beneath the surface.
            </h4>
        </>
    );
};

DepthTest.args = {
    id: "DepthTest",
    resources: {
        wellsData: "./volve_wells.json",
    },

    views: {
        layout: [1, 2],
        viewports: [
            {
                id: "view_1",
                layerIds: ["hugin", "wells-layer"],
                show3D: false,
                isSync: true,
            },
            {
                id: "view_2",
                layerIds: ["hugin", "wells-layer-no-depth-test"],
                show3D: false,
                isSync: true,
            },
        ],
    },
};

DepthTest.parameters = {
    docs: {
        description: {
            story: "Example using the depthTest property. If this is set to false it will disable depth testing for the layer",
        },
    },
};

// Example using "Map" layer. Uses float32 float for mesh and properties.
const wellLayers = [
    {
        ...defaultProps.layers[0],
        refine: false,
        outline: false,
        logData: "./volve_logs.json",
        logrunName: "BLOCKING",
        logName: "ZONELOG",
        logColor: "Stratigraphy",
        colorMappingFunction: createColorMapFunction("Stratigraphy"),
    },
];

const meshMapLayerFloat32 = {
    "@@type": "MapLayer",
    id: "mesh-layer",
    meshUrl: "hugin_depth_25_m.float32",
    frame: {
        origin: [432150, 6475800],
        count: [291, 229],
        increment: [25, 25],
        rotDeg: 0,
    },
    propertiesUrl: "kh_netmap_25_m.float32",
    contours: [0, 100],
    isContoursDepth: true,
    gridLines: false,
    material: false,
    colorMapName: "Physics",
};

//eslint-disable-next-line
const MultiColorSelectorTemplate = (args: any) => {
    const [wellLogColorName, setWellLogColorName] =
        React.useState("Stratigraphy");
    const [isLog, setIsLog] = React.useState(false);
    const wellLayerData = React.useCallback(
        (data) => {
            console.log(data);
            setWellLogColorName(data.name ? data.name : data.legendColorName);
        },
        [wellLogColorName]
    );

    // interpolation method
    const getInterpolateMethod = React.useCallback((data) => {
        setIsLog(data.isLog);
    }, []);

    const [mapLayerColorName, setMapLayerColorName1] =
        React.useState("Physics");
    const [colorRange, setRange] = React.useState();
    const [isAuto, setAuto] = React.useState();
    const [breakPoints, setBreakPoint] = React.useState();
    const [isMapLayerLog, setIsMapLayerLog] = React.useState(false);
    const [isNearest, setIsNearest] = React.useState(false);

    // user defined breakpoint(domain)
    const userDefinedBreakPoint = React.useCallback((data) => {
        if (data) setBreakPoint(data.colorArray);
    }, []);

    // Get color name from color selector
    const colorNameFromSelector = React.useCallback((data) => {
        setMapLayerColorName1(data);
    }, []);

    // user defined range
    const userDefinedRange = React.useCallback((data) => {
        if (data.range) setRange(data.range);
        setAuto(data.isAuto);
    }, []);

    // Get interpolation method from color selector to layer
    const getMapLayerInterpolateMethod = React.useCallback((data) => {
        setIsMapLayerLog(data.isLog);
        setIsNearest(data.isNearest);
    }, []);

    // color map function
    const colorMapFunc = React.useCallback(() => {
        return createColorMapFunction(
            mapLayerColorName,
            isMapLayerLog,
            isNearest,
            breakPoints
        );
    }, [mapLayerColorName, isMapLayerLog, isNearest, breakPoints]);

    const min = -3071;
    const max = 41048;

    const layers = [
        {
            ...meshMapLayerFloat32,
            colorMapName: mapLayerColorName,
            colorMapRange:
                colorRange && isAuto == false ? colorRange : [min, max],
            colorMapFunction: colorMapFunc(),
        },
        {
            ...args.wellLayers[0],
            colorMappingFunction: createColorMapFunction(wellLogColorName),
            logColor: wellLogColorName
                ? wellLogColorName
                : wellLayers[0].logColor,
            isLog: isLog,
            depthTest: false,
        },
    ];
    return (
        <SubsurfaceViewer {...args} layers={layers}>
            {
                <View id="view_1">
                    <ColorLegend
                        {...args}
                        getScale={wellLayerData}
                        getInterpolateMethod={getInterpolateMethod}
                        dataObjectName={"WellLogColorSelector"}
                        cssLegendStyles={{ top: 50, left: 0 }}
                        colorName={wellLogColorName}
                    />
                    <ColorLegend
                        {...args}
                        min={min}
                        max={41048}
                        colorNameFromSelector={colorNameFromSelector}
                        getColorRange={userDefinedRange}
                        getInterpolateMethod={getMapLayerInterpolateMethod}
                        getBreakpointValue={userDefinedBreakPoint}
                        horizontal={true}
                        numberOfTicks={2}
                        dataObjectName={"MapLayerColorSelector"}
                        cssLegendStyles={{ top: 90, left: 0 }}
                        colorName={mapLayerColorName}
                    />
                </View>
            }
        </SubsurfaceViewer>
    );
};

//eslint-disable-next-line
export const MultiColorSelector: any = MultiColorSelectorTemplate.bind({});

// prop for legend
const discreteData = {
    Above_BCU: [[], 0],
    ABOVE: [[], 1],
    H12: [[], 2],
    H11: [[], 3],
    H10: [[], 4],
    H9: [[], 5],
    H8: [[], 6],
    H7: [[], 7],
    H6: [[], 8],
    H5: [[], 9],
    H4: [[], 10],
    H3: [[], 11],
    H2: [[], 12],
    H1: [[], 13],
    BELOW: [[], 14],
};

MultiColorSelector.args = {
    wellLayerMin: 0,
    wellLayerMax: 0.35,
    dataObjectName: "ZONELOG",
    position: [16, 10],
    horizontal: true,
    colorTables,
    discreteData,
    ...defaultProps,
    id: defaultProps.id,
    wellLayers,
    legend: {
        visible: false,
    },
    reverseRange: false,
    views: {
        layout: [1, 1],
        showLabel: true,
        viewports: [
            {
                id: "view_1",
                zoom: -4,
            },
        ],
    },
};

MultiColorSelector.parameters = {
    docs: {
        description: {
            story: "Clicking on legend opens(toggle) the color selector component and then click on the color scale to update the layer that the selector target with.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
