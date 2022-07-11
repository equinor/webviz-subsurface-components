import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { format } from "d3-format";
import DeckGLMap from "./DeckGLMap";
import { PickInfo, TooltipCallback } from "../..";
//import Map3DLayer from "./layers/terrain/map3DLayer";
import { WellsPickInfo } from "./layers/wells/wellsLayer";
import { ExtendedLayerProps, PropertyDataType } from "./layers/utils/layerTools";
import { TerrainMapPickInfo } from "./layers/terrain/terrainMapLayer";

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

function mdTooltip(info: PickInfo<unknown>) {
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
    //properties: Array<Record<string, unknown>> | PropertyDataType[],
    filter: string[] | boolean
): string => {
    if (!properties) {
        return "";
    }

    let outputString = "";

    if (typeof filter == "boolean") {
        if (filter) {
            properties.forEach((ppobj: Record<string, unknown>) => {
                outputString += `\n${ppobj["name"]} : ${ppobj["value"]}`;
            });
        }
    } else {
        // filter is not boolean - thus it is a string array and we should check each property
        properties.forEach((ppobj: Record<string, unknown>) => {
            if (filter.includes(ppobj["name"] as string)) {
                outputString += `\n${ppobj["name"]} : ${ppobj["value"]}`;
            }
        });
    }
    return outputString;
};

const tooltipImpFunc: TooltipCallback = (
    info: PickInfo<unknown>
): Record<string, unknown> | string | null => {
    if (!info.picked || !info.layer) {
        return null;
    }
    const outputObject: Record<string, unknown> = {};
    const layerName = info.layer.constructor.name;
    let outputString = "";
    if (layerName === "Map3DLayer") {
        const layer = info.layer;
        const layerProps = layer.props as ExtendedLayerProps<unknown>;
        const layerName = layerProps.name;
        const properties = (info as TerrainMapPickInfo).properties;
        outputString += `Property: ${layerName}`;
        outputString += processPropInfo(properties, true);
    } else if (layerName === "WellsLayer") {
        const wellsPickInfo = info as WellsPickInfo;
        const layer = wellsPickInfo.layer;
        const layerProps = layer.props as Well
        const layerName = layerProps.name;
        const properties = wellsPickInfo.properties;
        const wellsPickInfoObject = wellsPickInfo.object as Record<
            string,
            unknown
        >;
        outputString += `Well: ${properties?.name}`;
        outputString += processPropInfo(info.properties, true);
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
            story: "Example of overriding the default tooltip, showing measured depth (MD) instead of the default bahaviour, which is to show the well name.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
