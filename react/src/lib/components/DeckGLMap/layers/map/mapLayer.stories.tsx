import React from "react";
import { useHoverInfo } from "../../components/Map";
import DeckGLMap from "../../DeckGLMap";
import InfoCard from "../../components/InfoCard";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Slider } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { ContinuousLegend } from "@emerson-eps/color-tables";

export default {
    component: DeckGLMap,
    title: "DeckGLMap / Map Float Layer",
} as ComponentMeta<typeof DeckGLMap>;

type NumberQuad = [number, number, number, number];

const valueRange = [-3071, 41048];

// Example using "Map" layer. Uses float32 mesh and properties binary arrays. Not PNG.
const meshMapLayer = {
    "@@type": "MapLayer",
    id: "mesh-layer",
    meshUrl: "hugin_depth_5_m.float32",
    frame: {
        origin: [432150, 6475800],
        count: [1451, 1141],
        increment: [5, 5],
        rotDeg: 0,
    },
    propertiesUrl: "kh_netmap_5_m.float32",
    contours: [0, 100.0],
    isContoursDepth: true,
    material: true,
    colorMapName: "Physics",
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
    if (x > breakpoint) return [0, 50, 200];
    return [255, 255, 0];
}

function createColorMap(breakpoint: number) {
    return (value: number) => breakpointColorMap(value, breakpoint);
}

const axes_hugin = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [432150, 6475800, -3500, 439400, 6481500, 0],
};
const north_arrow_layer = {
    "@@type": "NorthArrow3DLayer",
    id: "north-arrow-layer",
};

export const MapLayer: ComponentStory<typeof DeckGLMap> = (args) => {
    return <DeckGLMap {...args} />;
};

MapLayer.args = {
    id: "map",
    layers: [axes_hugin, meshMapLayer, north_arrow_layer],
    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
};

export const MapLayer3d: ComponentStory<typeof DeckGLMap> = (args) => {
    return <DeckGLMap {...args} />;
};

MapLayer3d.args = {
    id: "map",
    layers: [axes_hugin, meshMapLayer, north_arrow_layer],
    bounds: [432150, 6475800, 439400, 6481500] as NumberQuad,
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
            story: "Default color scale.",
        },
    },
};

export const Readout: ComponentStory<typeof DeckGLMap> = () => {
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
            <DeckGLMap {...args} />
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

export const BreakpointColorMap: ComponentStory<typeof DeckGLMap> = (args) => {
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
                <DeckGLMap {...props} />
                <div className={useStyles().legend}>
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
