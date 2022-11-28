import LayersIcon from "@material-ui/icons/Layers";
import { makeStyles } from "@material-ui/core";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import DeckGLMap from "../../DeckGLMap";

export default {
    component: DeckGLMap,
    title: "DeckGLMap / Lasso Layer",
} as ComponentMeta<typeof DeckGLMap>;

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

export const lassoLayerTemplate: ComponentStory<typeof DeckGLMap> = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    const [argsState, setArgsState] =
        React.useState<Record<string, unknown>>(disableLassoArgs);
    const [alignment, setAlignment] = React.useState("");
    const handleChange1 = React.useCallback(
        (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            _event: any,
            newAlignment: React.SetStateAction<string>
        ) => {
            const lassoLayer = disableLassoArgs.layers.filter(
                (item) => item["@@type"] === "LassoLayer"
            );
            if (lassoLayer[0].visible !== undefined) {
                lassoLayer[0].visible = !lassoLayer[0].visible;
            }
            setAlignment(newAlignment);
            if (lassoLayer[0].visible) {
                setArgsState(enableLassoArgs);
            } else {
                setArgsState(disableLassoArgs);
            }
        },
        [argsState]
    );

    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);

    return (
        <>
            <div className={useStyles().main}>
                <DeckGLMap
                    id={"DeckGL-Map"}
                    {...argsState}
                    editedData={editedData}
                    setProps={(updatedProps) => {
                        setEditedData(updatedProps);
                    }}
                />
            </div>
            <ToggleButtonGroup
                value={alignment}
                exclusive
                onChange={handleChange1}
                aria-label="text alignment"
            >
                <ToggleButton value="left" aria-label="left aligned">
                    <LayersIcon />
                </ToggleButton>
            </ToggleButtonGroup>
        </>
    );
};

const enableLassoArgs = {
    id: "DeckGL-Map",
    resources: {
        propertyMap:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/propertyMap.png",
        depthMap:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/propertyMap.png",
        wellsData:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/volve_wells.json",
        logData:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/volve_logs.json",
    },
    bounds: [432205, 6475078, 437720, 6481113],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
            logData: "@@#resources.logData",
            logrunName: "BLOCKING",
            logName: "ZONELOG",
            logColor: "Stratigraphy",
        },
        {
            "@@type": "PieChartLayer",
            data: "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/piechart.json",
        },
        {
            "@@type": "LassoLayer",
            visible: true,
            data: "@@#resources.wellsData",
            logData: "@@#resources.logData",
            logrunName: "BLOCKING",
            logName: "ZONELOG",
            logColor: "Stratigraphy",
        },
    ],
    editedData: {},
    views: {
        layout: [1, 1],
        showLabel: false,
        viewports: [
            {
                id: "view_1",
                show3D: false,
                layerIds: [],
            },
        ],
    },
};

const disableLassoArgs = {
    id: "DeckGL-Map",
    resources: {
        propertyMap:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/propertyMap.png",
        depthMap:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/propertyMap.png",
        wellsData:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/volve_wells.json",
        logData:
            "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/volve_logs.json",
    },
    bounds: [432205, 6475078, 437720, 6481113],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
            logData: "@@#resources.logData",
            logrunName: "BLOCKING",
            logName: "ZONELOG",
            logColor: "Stratigraphy",
        },
        {
            "@@type": "PieChartLayer",
            data: "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/piechart.json",
        },
        {
            "@@type": "LassoLayer",
            visible: false,
            data: "@@#resources.wellsData",
            logData: "@@#resources.logData",
            logrunName: "BLOCKING",
            logName: "ZONELOG",
            logColor: "Stratigraphy",
        },
    ],
    editedData: {},
    views: {
        layout: [1, 1],
        showLabel: false,
        viewports: [
            {
                id: "view_1",
                show3D: false,
                layerIds: [],
            },
        ],
    },
};
