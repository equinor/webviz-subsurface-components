import React from "react";
import { useHoverInfo, PickingInfo } from "../../components/Map";
import DeckGLMap from "../../DeckGLMap";
import InfoCard from "../../components/InfoCard";
import { ComponentStory, ComponentMeta } from "@storybook/react";

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

    const args = React.useMemo<any>(() => {
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
