import type { SyntheticEvent } from "react";
import React from "react";
import type { ComponentMeta } from "@storybook/react";
import { styled } from "@mui/material/styles";
import type { BoundingBox3D } from "../../components/Map";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { ComponentStory } from "@storybook/react";
import { Slider } from "@mui/material";
import {
    ContinuousLegend,
    ColorLegend,
    createColorMapFunction,
} from "@emerson-eps/color-tables";
import { View } from "@deck.gl/core/typed";

const PREFIX = "MapLayer3dPng";

const classes = {
    main: `${PREFIX}-main`,
    legend: `${PREFIX}-legend`,
};

const Root = styled("div")({
    [`& .${classes.main}`]: {
        height: 500,
        border: "1px solid black",
        position: "relative",
    },
    [`& .${classes.legend}`]: {
        width: 100,
        position: "absolute",
        top: "0",
        right: "0",
    },
});

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Map Layer / Colormap",
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },
} as ComponentMeta<typeof SubsurfaceViewer>;

type NumberQuad = [number, number, number, number];

const valueRange = [-3071, 41048];

// Example using "Map" layer. Uses PNG float for mesh and properties.
const meshMapLayerPng = {
    "@@type": "MapLayer",
    id: "mesh-layer",
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
    ZIncreasingDownwards: true,
};

// Example using "Map" layer. Uses float32 float for mesh and properties.
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

const axes_hugin = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [432150, 6475800, 2000, 439400, 6481500, 3500] as BoundingBox3D,
};

const north_arrow_layer = {
    "@@type": "NorthArrow3DLayer",
    id: "north-arrow-layer",
};

const defaultArgs = {
    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
};

const DEFAULT_VIEWS = {
    layout: [1, 1] as [number, number],
    viewports: [
        {
            id: "view_1",
            show3D: true,
        },
    ],
};

const defaultParameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
    },
};

function gradientColorMap(x: number) {
    return [255 - x * 255, 255 - x * 100, 255 * x];
}

function nearestColorMap(x: number) {
    if (x > 0.5) return [100, 255, 255];
    else if (x > 0.1) return [255, 100, 255];
    return [255, 255, 100];
}

function breakpointColorMap(x: number, breakpoint: number) {
    if (x > breakpoint) return [0, 50, 200];
    return [255, 255, 0];
}

function createColorMap(breakpoint: number) {
    return (value: number) => breakpointColorMap(value, breakpoint);
}

export const ConstantColor: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    return <SubsurfaceViewer {...args} />;
};

ConstantColor.args = {
    id: "map",
    layers: [
        axes_hugin,
        {
            ...meshMapLayerPng,
            colorMapFunction: [0, 255, 0], // Use constant color instead of function
        },
        north_arrow_layer,
    ],

    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
    views: DEFAULT_VIEWS,
};

ConstantColor.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: 'Example using the property "colorMapFunction" to color the surface in one color only',
        },
    },
};

export const GradientFunctionColorMap: ComponentStory<
    typeof SubsurfaceViewer
> = () => {
    const args = {
        ...defaultArgs,
        id: "gradient-color-map",
        layers: [
            { ...meshMapLayerFloat32, colorMapFunction: gradientColorMap },
        ],
    };
    return <SubsurfaceViewer {...args} />;
};

GradientFunctionColorMap.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using gradient color mapping function.",
        },
    },
};

export const StepFunctionColorMap: ComponentStory<
    typeof SubsurfaceViewer
> = () => {
    const args = {
        ...defaultArgs,
        id: "nearest-color-map",
        layers: [
            {
                ...meshMapLayerFloat32,
                material: true,
                colorMapFunction: nearestColorMap,
            },
        ],
    };

    return <SubsurfaceViewer {...args} />;
};

StepFunctionColorMap.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using step color mapping function.",
        },
    },
};

export const DefaultColorScale: ComponentStory<
    typeof SubsurfaceViewer
> = () => {
    const args = {
        ...defaultArgs,
        id: "default-color-scale",
        layers: [{ ...meshMapLayerFloat32 }],
    };

    return <SubsurfaceViewer {...args} />;
};

DefaultColorScale.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Default color scale.",
        },
    },
};

export const BreakpointColorMap: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    const [breakpoint, setBreakpoint] = React.useState<number>(0.5);

    const colorMap = React.useCallback(
        (value: number) => {
            return createColorMap(breakpoint)(value);
        },
        [breakpoint]
    );

    const layer = {
        ...args?.layers?.[0],
        colorMapFunction: colorMap,
    };

    const props = {
        ...args,
        layers: [layer],
    };

    const handleChange = React.useCallback(
        (_event: Event | SyntheticEvent, value: number | number[]) => {
            setBreakpoint((value as number) / 100);
        },
        []
    );

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
                <div className={classes.legend}>
                    <ContinuousLegend
                        min={valueRange[0]}
                        max={valueRange[1]}
                        colorMapFunction={colorMap}
                    />
                </div>
            </div>
            <Slider
                min={0}
                max={100}
                defaultValue={50}
                step={1}
                onChangeCommitted={handleChange}
            />
        </Root>
    );
};

BreakpointColorMap.args = {
    ...defaultArgs,
    id: "breakpoint-color-map",
    layers: [
        {
            ...meshMapLayerFloat32,
            gridLines: false,
            material: true,
        },
    ],
};

BreakpointColorMap.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using a color scale with a breakpoint.",
        },
    },
};

export const ColorMapRange: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    const [colorMapUpper, setColorMapUpper] = React.useState<number>(41048);

    const layer = {
        ...args?.layers?.[0],
        colorMapRange: [-3071, colorMapUpper],
    };

    const props = {
        ...args,
        layers: [layer],
    };

    const handleChange = React.useCallback(
        (_event: unknown, value: number | number[]) => {
            setColorMapUpper(value as number);
        },
        []
    );

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
            </div>
            <Slider
                min={10000}
                max={41048}
                defaultValue={41048}
                step={1000}
                onChange={handleChange}
            />
        </Root>
    );
};

ColorMapRange.args = {
    ...defaultArgs,
    id: "breakpoint-color-map",
    layers: [
        {
            ...meshMapLayerFloat32,
            colorMapName: "Seismic",
            colorMapClampColor: false,
            gridLines: false,
            material: true,
        },
    ],
};

ColorMapRange.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: 'Example changing the "ColorMapRange" property using a slider.',
        },
    },
};

// Map layer with color colorselector

const MapLayerColorSelectorTemplate: ComponentStory<typeof SubsurfaceViewer> = (
    args
) => {
    const [colorName, setColorName] = React.useState("Rainbow");
    const [colorRange, setRange] = React.useState();
    const [isAuto, setAuto] = React.useState();
    const [breakPoints, setBreakPoint] = React.useState();
    const [isLog, setIsLog] = React.useState(false);
    const [isNearest, setIsNearest] = React.useState(false);

    // user defined breakpoint(domain)
    const userDefinedBreakPoint = React.useCallback(
        (data: { colorArray: React.SetStateAction<undefined> }) => {
            if (data) setBreakPoint(data.colorArray);
        },
        []
    );

    // Get color name from color selector
    const colorNameFromSelector = React.useCallback(
        (data: React.SetStateAction<string>) => {
            setColorName(data);
        },
        []
    );

    // user defined range
    const userDefinedRange = React.useCallback(
        (data: {
            range: React.SetStateAction<undefined>;
            isAuto: React.SetStateAction<undefined>;
        }) => {
            if (data.range) setRange(data.range);
            setAuto(data.isAuto);
        },
        []
    );

    // Get interpolation method from color selector to layer
    const getInterpolateMethod = React.useCallback(
        (data: {
            isLog: boolean | ((prevState: boolean) => boolean);
            isNearest: boolean | ((prevState: boolean) => boolean);
        }) => {
            setIsLog(data.isLog);
            setIsNearest(data.isNearest);
        },
        []
    );

    // color map function
    const colorMapFunc = React.useCallback(() => {
        return createColorMapFunction(colorName, isLog, isNearest, breakPoints);
    }, [colorName, isLog, isNearest, breakPoints]);

    const min = 100;
    const max = 1000;

    const updatedLayerData = [
        {
            ...meshMapLayerFloat32,
            colorMapName: colorName,
            colorMapRange:
                colorRange && isAuto == false ? colorRange : [min, max],
            colorMapFunction: colorMapFunc(),
        },
    ];
    return (
        <SubsurfaceViewer {...args} layers={updatedLayerData}>
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="view_1">
                    <div style={{ marginTop: 50 }}>
                        <ColorLegend
                            min={min}
                            max={max}
                            colorNameFromSelector={colorNameFromSelector}
                            getColorRange={userDefinedRange}
                            getInterpolateMethod={getInterpolateMethod}
                            getBreakpointValue={userDefinedBreakPoint}
                            horizontal={true}
                            numberOfTicks={2}
                        />
                    </div>
                </View>
            }
        </SubsurfaceViewer>
    );
};

export const ColorSelector = MapLayerColorSelectorTemplate.bind({});

ColorSelector.args = {
    ...defaultArgs,
    id: "map_layer_color_selector",
    legend: {
        visible: true,
    },
    layers: [{ ...meshMapLayerFloat32 }],
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
