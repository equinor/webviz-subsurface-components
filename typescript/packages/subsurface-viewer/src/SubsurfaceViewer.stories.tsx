import React, { useCallback, useMemo, useState } from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { format } from "d3-format";
import { PickingInfo, View } from "@deck.gl/core/typed";
import { ContinuousLegend } from "@emerson-eps/color-tables";
import SubsurfaceViewer, { SubsurfaceViewerProps } from "./SubsurfaceViewer";
import {
    MapMouseEvent,
    TooltipCallback,
    ViewStateType,
    ViewsType,
} from "./components/Map";
import { WellsLayer, MapLayer } from "./layers";
import InfoCard from "./components/InfoCard";
import { ExtendedLayerProps, LayerPickInfo } from "./layers/utils/layerTools";
import { WellsPickInfo } from "./layers/wells/wellsLayer";
import { FeatureCollection } from "geojson";
import { ViewFooter } from "./components/ViewFooter";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer",
} as ComponentMeta<typeof SubsurfaceViewer>;

const classes = {
    main: "default-main",
};

const Root = styled("div")({
    [`& .${classes.main}`]: {
        width: 750,
        height: 500,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        border: "1px solid black",
        background: "azure",
        position: "absolute",
    },
});

const defaultWellsProps = {
    id: "volve-wells",
    data: "./volve_wells.json",
};

const defaultWellsLayer = new WellsLayer({
    ...defaultWellsProps,
});

const defaultProps = {
    id: "volve-wells",
    bounds: [432150, 6475800, 439400, 6481500] as [
        number,
        number,
        number,
        number
    ],
    layers: [defaultWellsLayer],
};

const wellsLayerWithlogs = new WellsLayer({
    ...defaultWellsProps,
    logData: "./volve_logs.json",
    logrunName: "BLOCKING",
    logName: "PORO",
    logColor: "Physics",
});

const meshMapLayerBig = new MapLayer({
    "@@type": "MapLayer",
    id: "mesh-layer",
    meshData: "hugin_depth_5_m.float32",
    frame: {
        origin: [432150, 6475800],
        count: [1451, 1141],
        increment: [5, 5],
        rotDeg: 0,
    },
    propertiesData: "kh_netmap_5_m.float32",
    contours: [0, 100],
    isContoursDepth: true,
    gridLines: false,
    material: true,
    colorMapName: "Physics",
});

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
        new WellsLayer({
            ...defaultWellsProps,
            lineStyle: { width: 7 },
        }),
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
        const layerProps = info.layer.props as unknown as ExtendedLayerProps;
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
        new WellsLayer({
            ...defaultWellsProps,
            lineStyle: { width: 7 },
        }),
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

const mapProps = {
    id: "kh_netmap",
    meshData: "hugin_depth_25_m.float32",
    frame: {
        origin: [432150, 6475800] as [number, number],
        count: [291, 229] as [number, number],
        increment: [25, 25] as [number, number],
        rotDeg: 0,
    },
    propertiesData: "kh_netmap_25_m.float32",
    contours: [0, 100] as [number, number],
    material: false,
};

const netmapLayer = new MapLayer({ ...mapProps });
const huginLayer = new MapLayer({
    ...mapProps,
    id: "hugin",
    propertiesData: "hugin_depth_25_m.float32",
});

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
    layers: [netmapLayer, huginLayer],
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
    layers: [netmapLayer, huginLayer],
    views: {} as ViewsType,
};

const wellsLayerNoDepthTest = new WellsLayer({
    ...defaultWellsProps,
    id: "wells-layer-no-depth-test",
    depthTest: false,
});

export const DepthTest: ComponentStory<typeof SubsurfaceViewer> = (args) => {
    const props = {
        ...args,
        layers: [huginLayer, defaultWellsLayer, wellsLayerNoDepthTest],
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
    views: {
        layout: [1, 2],
        viewports: [
            {
                id: "view_1",
                layerIds: ["hugin", "volve-wells"],
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

function getReadout(event: MapMouseEvent) {
    const pickInfo = event.infos;
    return <InfoCard pickInfos={pickInfo} />;
}

const MouseEventStory = (args: { show3d: boolean }) => {
    const [event, setEvent] = useState<MapMouseEvent>({
        type: "click",
        infos: [],
    });

    const handleEvent = useCallback(
        (event: MapMouseEvent) => {
            setEvent(event);
        },
        [setEvent]
    );

    const useProps = useMemo(() => {
        const props = {
            ...defaultProps,
            layers: [wellsLayerWithlogs, netmapLayer],
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
        <SubsurfaceViewer {...useProps}>
            <View id="test">
                {getReadout(event)}
                <ViewFooter>Mouse event example</ViewFooter>
            </View>
        </SubsurfaceViewer>
    );
};

export const MouseEvent: ComponentStory<typeof MouseEventStory> = (args) => {
    return <MouseEventStory {...args} />;
};

MouseEvent.args = {
    show3d: true,
};

const ViewStateSynchronizationStory = (args: {
    show3d: boolean;
    sync: string[];
}) => {
    const subsurfaceViewerArgs = {
        id: "view_state_synchronization",
        layers: [netmapLayer, huginLayer, defaultWellsLayer],
        views: {
            layout: [2, 2] as [number, number],
            viewports: [
                {
                    id: "view_1",
                    layerIds: ["hugin"],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_1"),
                },
                {
                    id: "view_2",
                    layerIds: ["kh_netmap"],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_2"),
                },
                {
                    id: "view_3",
                    layerIds: ["volve-wells"],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_3"),
                },
                {
                    id: "view_4",
                    layerIds: ["volve-wells", "hugin"],
                    show3D: args.show3d,
                    isSync: args.sync.includes("view_4"),
                },
            ],
        },
    };
    return <SubsurfaceViewer {...subsurfaceViewerArgs} />;
};

export const ViewStateSynchronization: ComponentStory<
    typeof ViewStateSynchronizationStory
> = (args) => {
    return <ViewStateSynchronizationStory {...args} />;
};

ViewStateSynchronization.args = {
    show3d: false,
    sync: ["view_1", "view_2", "view_3", "view_4"],
};

ViewStateSynchronization.argTypes = {
    sync: {
        options: ["view_1", "view_2", "view_3", "view_4"],
        control: "check",
    },
};

export const IsLoadedCallback = (args: SubsurfaceViewerProps) => {
    const [layers, setLayers] = React.useState([defaultWellsLayer] as [
        WellsLayer,
        MapLayer?
    ]);
    const [label, setLabel] = React.useState("");

    const handleChange = () => {
        if (layers.length === 1) {
            setLayers([defaultWellsLayer, meshMapLayerBig]);
        } else {
            setLayers([defaultWellsLayer]);
        }
    };

    const props = {
        ...args,
        isLoadedCallback: (isLoaded: boolean) => {
            console.log("isLoadedCallback", isLoaded);
            setLabel(isLoaded ? "LOADED" : "NOT LOADED");
            return;
        },
        layers,
    };

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...props} />
            </div>
            <label>{"Add big map layer "}</label>
            <Switch onClick={handleChange} />
        </Root>
    );
};

IsLoadedCallback.args = {
    id: "DeckGL-Map",
    layers: [meshMapLayerBig, defaultWellsLayer],
    bounds: [432150, 6475800, 439400, 6481501],
    views: {
        layout: [1, 1],
        viewports: [
            {
                id: "view_1",
                show3D: false,
            },
        ],
    },
};

IsLoadedCallback.parameters = {
    docs: {
        inlineStories: false,
        iframeHeight: 500,
        description: {
            story: "IsLoadedCallback will report in console when triggered",
        },
    },
};
