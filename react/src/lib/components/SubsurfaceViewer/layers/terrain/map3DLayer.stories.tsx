import React from "react";
import { useHoverInfo } from "../../components/Map";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import InfoCard from "../../components/InfoCard";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Slider } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ContinuousLegend } from "@emerson-eps/color-tables";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Map 3D Delatin mesh Layer",
} as ComponentMeta<typeof SubsurfaceViewer>;

type NumberQuad = [number, number, number, number];

const meshMapLayer = {
    "@@type": "Map3DLayer",
    id: "mesh-layer",
    bounds: [432205, 6475078, 437720, 6481113] as NumberQuad,
    mesh: "hugin_depth_25_m_normalized_margin.png",
    meshValueRange: [2782, 3513],
    propertyTexture: "kh_netmap_25_m_normalized_margin.png",
    propertyValueRange: [-3071, 41048],
    contours: [0, 50.0],
    isContoursDepth: true,
};

const defaultArgs = {
    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
};

const defaultParameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
    },
};

const axes = {
    "@@type": "AxesLayer",
    id: "axes-layer",
    bounds: [432205, 6475078, -3500, 437720, 6481113, 0],
};
const north_arrow_layer = {
    "@@type": "NorthArrow3DLayer",
    id: "north-arrow-layer",
};

export const MapLayer3d: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    return <SubsurfaceViewer {...args} />;
};

MapLayer3d.args = {
    id: "map",
    layers: [axes, meshMapLayer, north_arrow_layer],
    bounds: [432205, 6475078, 437720, 6481113] as NumberQuad,
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

MapLayer3d.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "3d example.",
        },
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

export const GradientFunctionColorMap: ComponentStory<
    typeof SubsurfaceViewer
> = () => {
    const args = {
        ...defaultArgs,
        id: "gradient-color-map",
        layers: [{ ...meshMapLayer, colorMapFunction: gradientColorMap }],
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
        layers: [{ ...meshMapLayer, colorMapFunction: nearestColorMap }],
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
        layers: [{ ...meshMapLayer }],
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

export const Readout: ComponentStory<typeof SubsurfaceViewer> = () => {
    const [hoverInfo, hoverCallback] = useHoverInfo();

    const args = React.useMemo(() => {
        return {
            ...defaultArgs,
            id: "readout",
            layers: [{ ...meshMapLayer }],
            coords: {
                visible: false,
            },
            onMouseEvent: hoverCallback,
        };
    }, [hoverCallback]);

    return (
        <>
            <SubsurfaceViewer {...args} />
            {hoverInfo && <InfoCard pickInfos={hoverInfo} />}
        </>
    );
};

Readout.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Readout example.",
        },
    },
};

const useStyles = makeStyles({
    main: {
        height: 500,
        border: "1px solid black",
        position: "relative",
    },
    legend: {
        width: 100,
        position: "absolute",
        top: "0",
        right: "0",
    },
});

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

    const props = React.useMemo(() => {
        return {
            ...args,
            layers: [
                {
                    ...meshMapLayer,
                    colorMapFunction: colorMap,
                },
            ],
            legend: { visible: false },
        };
    }, [breakpoint]);

    const handleChange = React.useCallback((_event, value) => {
        setBreakpoint(value / 100);
    }, []);

    return (
        <>
            <div className={useStyles().main}>
                <SubsurfaceViewer {...props} />
                <div className={useStyles().legend}>
                    <ContinuousLegend
                        min={meshMapLayer.propertyValueRange[0]}
                        max={meshMapLayer.propertyValueRange[1]}
                    />
                </div>
            </div>
            <Slider
                min={0}
                max={100}
                defaultValue={50}
                step={1}
                onChange={handleChange}
            />
        </>
    );
};

BreakpointColorMap.args = {
    ...defaultArgs,
    id: "breakpoint-color-map",
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

    const props = React.useMemo(() => {
        return {
            ...args,
            layers: [
                {
                    ...meshMapLayer,
                    colorMapName: "Seismic",
                    colorMapRange: [-3071, colorMapUpper],
                    colorMapClampColor: false,
                },
            ],
            legend: { visible: true },
        };
    }, [colorMapUpper]);

    const handleChange = React.useCallback((_event, value) => {
        setColorMapUpper(value);
    }, []);

    return (
        <>
            <div className={useStyles().main}>
                <SubsurfaceViewer {...props} />
            </div>
            <Slider
                min={10000}
                max={41048}
                defaultValue={41048}
                step={1}
                onChange={handleChange}
            />
        </>
    );
};

ColorMapRange.args = {
    ...defaultArgs,
    id: "breakpoint-color-map",
};

ColorMapRange.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: 'Example changin the colorcamp range ("ColorMapRange" property).',
        },
    },
};
