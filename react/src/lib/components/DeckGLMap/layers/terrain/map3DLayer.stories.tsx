import React from "react";
import DeckGLMap from "../../DeckGLMap";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Slider } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

export default {
    component: DeckGLMap,
    title: "DeckGLMap / Map 3D Layer",
} as ComponentMeta<typeof DeckGLMap>;

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

function gradientColorMap(x: number) {
    return [255 - x * 255, 255 - x * 100, 255 * x];
}

function nearestColorMap(x: number) {
    if (x > 0.5) return [100, 255, 255];
    else if (x > 0.1) return [255, 100, 255];
    return [255, 255, 100];
}

function breakpointColorMap(x: number, breakpoint: number) {
    if (x > breakpoint) return [100, 255, 255];
    return [255, 255, 100];
}

function createColorMap(breakpoint: number) {
    return (value: number) => breakpointColorMap(value, breakpoint);
}

export const GradientFunctionColorMap: ComponentStory<
    typeof DeckGLMap
> = () => {
    const args = {
        ...defaultArgs,
        id: "gradient-color-map",
        layers: [{ ...meshMapLayer, colorMapFunction: gradientColorMap }],
    };
    return <DeckGLMap {...args} />;
};

GradientFunctionColorMap.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using gradient color mapping function.",
        },
    },
};

export const StepFunctionColorMap: ComponentStory<typeof DeckGLMap> = () => {
    const args = {
        ...defaultArgs,
        id: "nearest-color-map",
        layers: [{ ...meshMapLayer, colorMapFunction: nearestColorMap }],
    };

    return <DeckGLMap {...args} />;
};

StepFunctionColorMap.parameters = {
    docs: {
        ...defaultParameters.docs,
        description: {
            story: "Example using step color mapping function.",
        },
    },
};

export const DefaultColorScale: ComponentStory<typeof DeckGLMap> = () => {
    const args = {
        ...defaultArgs,
        id: "default-color-scale",
        layers: [{ ...meshMapLayer }],
    };

    return <DeckGLMap {...args} />;
};

DefaultColorScale.parameters = {
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
});

export const BreakpointColorMap: ComponentStory<typeof DeckGLMap> = (args) => {
    const [breakpoint, setBreakpoint] = React.useState<number>(0.5);

    const props = React.useMemo(() => {
        return {
            ...args,
            layers: [
                {
                    ...meshMapLayer,
                    colorMapFunction: createColorMap(breakpoint),
                },
            ],
        };
    }, [breakpoint]);

    const handleChange = React.useCallback((_event, value) => {
        setBreakpoint(value / 100);
    }, []);

    return (
        <>
            <div className={useStyles().main}>
                <DeckGLMap {...props} />;
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
