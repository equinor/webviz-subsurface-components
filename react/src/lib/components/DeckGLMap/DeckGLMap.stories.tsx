import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { format } from "d3-format";
import DeckGLMap from "./DeckGLMap";
import {
    TooltipCallback,
    LayerPickInfo,
    WellsPickInfo,
    ExtendedLayerProps,
    PropertyDataType,
    FeatureCollection,
} from "../..";
import { PickingInfo } from "@deck.gl/core/typed";
import { ViewStateType } from "./components/Map";

export default {
    component: DeckGLMap,
    title: "DeckGLMap",
} as ComponentMeta<typeof DeckGLMap>;

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

const Template: ComponentStory<typeof DeckGLMap> = (args) => (
    <DeckGLMap {...args} />
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

const CustomTemplate: ComponentStory<typeof DeckGLMap> = (args) => {
    const [state, setState] = React.useState(args.cameraPosition);

    const getCameraPosition = React.useCallback((input: ViewStateType) => {
        setState(input);
        return input;
    }, []);
    return (
        <>
            <DeckGLMap
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
