import type { Meta, StoryObj } from "@storybook/react";
import { format } from "d3-format";
import React from "react";

import type { Feature } from "geojson";

import type { PickingInfo } from "@deck.gl/core";
import { View } from "@deck.gl/core";

import SubsurfaceViewer from "../../SubsurfaceViewer";
import InfoCard from "../../components/InfoCard";
import type { MapMouseEvent, TooltipCallback } from "../../components/Map";
import { ViewFooter } from "../../components/ViewFooter";
import type {
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
} from "../../layers/utils/layerTools";
import type { WellsPickInfo } from "../../layers/wells/wellsLayer";

import {
    defaultStoryParameters,
    hugin25mKhNetmapMapLayer,
    volveWellsBounds,
    volveWellsLayer,
    volveWellsWithLogsLayer,
} from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Examples/Tooltip",
    args: {
        // Add some common controls for all the stories.
        triggerHome: 0,
    },
};
export default stories;

const mdTooltip = (info: PickingInfo): string | null => {
    if (!info.picked) return null;
    const value = (info as WellsPickInfo)?.properties?.[0].value;
    if (!value) return null;
    const f = format(".2f");
    const niceValue = f(+value);
    return "MD: " + niceValue;
};

export const TooltipApi: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        layers: [
            {
                ...volveWellsLayer,
                lineStyle: { width: 7 },
            },
        ],
        getTooltip: mdTooltip,
        bounds: volveWellsBounds,
    },

    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example of overriding the default tooltip, showing measured depth (MD) instead of the default behavior, which is to show the well name.",
            },
        },
    },
};

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
    if (layerName === "MapLayer") {
        const layerProps = info.layer.props as unknown as ExtendedLayerProps;
        const layerName = layerProps.name;
        const properties = (info as LayerPickInfo).properties;
        outputString += `Property: ${layerName}`;
        outputString += processPropInfo(properties, true);
    } else if (layerName === "WellsLayer") {
        const wellsPickInfo = info as WellsPickInfo;
        const wellsPickInfoObject = info.object as Feature;
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

export const TooltipStyle: StoryObj<typeof SubsurfaceViewer> = {
    args: {
        layers: [
            {
                ...volveWellsLayer,
                lineStyle: { width: 7 },
            },
        ],
        getTooltip: tooltipImpFunc,
        bounds: volveWellsBounds,
    },

    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Example of overriding tooltip style.",
            },
        },
    },
};

const getReadout = (event: MapMouseEvent) => {
    const pickInfo = event.infos;
    return <InfoCard pickInfos={pickInfo} />;
};

type MouseEvenComponentProps = {
    show3d: boolean;
};

const MouseEventComponent: React.FC<MouseEvenComponentProps> = (
    args: MouseEvenComponentProps
) => {
    const [event, setEvent] = React.useState<MapMouseEvent>({
        type: "click",
        infos: [],
    });

    const handleEvent = React.useCallback(
        (event: MapMouseEvent) => {
            setEvent(event);
        },
        [setEvent]
    );

    const subsurfaceProps = React.useMemo<Record<string, unknown>>(() => {
        const props = {
            layers: [volveWellsWithLogsLayer, hugin25mKhNetmapMapLayer],
            bounds: volveWellsBounds,
            onMouseEvent: handleEvent,
            views: {
                layout: [1, 1] as [number, number],
                viewports: [{ id: "test", show3D: args.show3d }],
            },
            coords: { visible: false },
        };
        return props;
    }, [handleEvent, args.show3d]);

    return (
        <SubsurfaceViewer id={"MouseEventComponent"} {...subsurfaceProps}>
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                /* @ts-expect-error */
                <View id="test">
                    {getReadout(event)}
                    <ViewFooter>Mouse event example</ViewFooter>
                </View>
            }
        </SubsurfaceViewer>
    );
};

export const MouseEvent: StoryObj<typeof MouseEventComponent> = {
    args: {
        show3d: true,
    },
    render: (args) => <MouseEventComponent {...args} />,
};
