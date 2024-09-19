import type { Meta, StoryObj } from "@storybook/react";
import type { SyntheticEvent } from "react";
import React from "react";

import { Slider } from "@mui/material";
import { styled } from "@mui/material/styles";

import { View } from "@deck.gl/core";

// @ts-expect-error TS6133
import type { ColorLegendProps } from "@emerson-eps/color-tables";
import {
    ColorLegend,
    ContinuousLegend,
    createColorMapFunction,
} from "@emerson-eps/color-tables";

import type { SubsurfaceViewerProps } from "../../SubsurfaceViewer";
import SubsurfaceViewer from "../../SubsurfaceViewer";

import {
    default3DViews,
    defaultStoryParameters,
    hugin25mKhNetmapMapLayer,
    hugin25mKhNetmapMapLayerPng,
    hugin2DBounds,
    huginAxes3DLayer,
    northArrowLayer,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Map Layer / Colormap",
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

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

const valueRange = [-3071, 41048];

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

export const ConstantColor: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "map",
        layers: [
            huginAxes3DLayer,
            {
                ...hugin25mKhNetmapMapLayerPng,
                colorMapFunction: [0, 255, 0], // Use constant color instead of function
            },
            northArrowLayer,
        ],

        bounds: hugin2DBounds,
        views: default3DViews,
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: 'Example using the property "colorMapFunction" to color the surface in one color only',
            },
        },
    },
};

export const GradientFunctionColorMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "gradient-color-map",
        bounds: hugin2DBounds,
        layers: [
            {
                ...hugin25mKhNetmapMapLayer,
                material: false,
                colorMapFunction: gradientColorMap,
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example using gradient color mapping function.",
            },
        },
    },
};

export const StepFunctionColorMap: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "nearest-color-map",
        bounds: hugin2DBounds,
        layers: [
            {
                ...hugin25mKhNetmapMapLayer,
                material: true,
                colorMapFunction: nearestColorMap,
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example using step color mapping function.",
            },
        },
    },
};

export const DefaultColorScale: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        id: "default-color-scale",
        bounds: hugin2DBounds,
        layers: [{ ...hugin25mKhNetmapMapLayer, material: false }],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Default color scale.",
            },
        },
    },
};

const BreakpointColorMapComponent: React.FC<
    // @ts-expect-error TS2709
    SubsurfaceViewerProps & ColorLegendProps
> = (props) => {
    const [breakpoint, setBreakpoint] = React.useState<number>(0.5);

    const colorMap = React.useCallback(
        (value: number) => {
            return createColorMap(breakpoint)(value);
        },
        [breakpoint]
    );

    const layer = {
        ...props?.layers?.[0],
        colorMapFunction: colorMap,
    };

    const propsWithLayers = {
        ...props,
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
                <SubsurfaceViewer {...propsWithLayers} />
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

export const BreakpointColorMap: StoryObj<typeof BreakpointColorMapComponent> =
    {
        args: {
            id: "breakpoint-color-map",
            bounds: hugin2DBounds,
            layers: [
                {
                    ...hugin25mKhNetmapMapLayer,
                    gridLines: false,
                    material: true,
                },
            ],
        },
        parameters: {
            docs: {
                ...defaultStoryParameters.docs,
                description: {
                    story: "Example using a color scale with a breakpoint.",
                },
            },
        },
        render: (args) => <BreakpointColorMapComponent {...args} />,
    };

const ColorMapRangeComponent: React.FC<SubsurfaceViewerProps> = (props) => {
    const [colorMapUpper, setColorMapUpper] = React.useState<number>(41048);

    const layer = {
        ...props?.layers?.[0],
        colorMapRange: [-3071, colorMapUpper],
    };

    const propsWithLayers = {
        ...props,
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
                <SubsurfaceViewer {...propsWithLayers} />
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

export const ColorMapRange: StoryObj<typeof ColorMapRangeComponent> = {
    args: {
        id: "breakpoint-color-map",
        bounds: hugin2DBounds,
        layers: [
            {
                ...hugin25mKhNetmapMapLayer,
                colorMapName: "Seismic",
                colorMapClampColor: false,
                gridLines: false,
                material: true,
            },
        ],
    },
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: 'Example changing the "ColorMapRange" property using a slider.',
            },
        },
    },
    render: (args) => <ColorMapRangeComponent {...args} />,
};

// Map layer with color colorselector

const MapLayerColorSelectorTemplate: React.FC<SubsurfaceViewerProps> = (
    props
) => {
    const [colorName, setColorName] = React.useState("Rainbow");
    const [colorRange, setRange] = React.useState();
    const [isAuto, setAuto] = React.useState();
    const [breakPoints, setBreakPoint] = React.useState<number[]>([]);
    const [isLog, setIsLog] = React.useState(false);
    const [isNearest, setIsNearest] = React.useState(false);

    // user defined breakpoint(domain)
    const userDefinedBreakPoint = React.useCallback(
        (data: { breakpoint: number[] }) => {
            if (data) {
                setBreakPoint(data.breakpoint);
            }
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
            ...props.layers?.[0],
            colorMapName: colorName,
            colorMapRange:
                colorRange && isAuto == false ? colorRange : [min, max],
            colorMapFunction: colorMapFunc(),
        },
    ];
    return (
        <SubsurfaceViewer {...props} layers={updatedLayerData}>
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

export const ColorSelector: StoryObj<typeof MapLayerColorSelectorTemplate> = {
    args: {
        id: "map_layer_color_selector",
        bounds: hugin2DBounds,
        layers: [{ ...hugin25mKhNetmapMapLayer, material: false }],
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
    },
    render: (args) => <MapLayerColorSelectorTemplate {...args} />,
};
