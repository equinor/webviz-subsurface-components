import { makeStyles } from "@material-ui/core";
import Switch from "@material-ui/core/Switch";
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
        React.useState<Record<string, unknown>>(enableLassoArgs);
    const [state, setState] = React.useState<boolean>(true);

    const handleChange = React.useCallback(() => {
        const lassoLayer = enableLassoArgs.layers.filter(
            (item) => item["@@type"] === "LassoLayer"
        );
        if (lassoLayer[0].visible !== undefined) {
            lassoLayer[0].visible = !lassoLayer[0].visible;
        }
        if (lassoLayer[0].visible) {
            setArgsState(enableLassoArgs);
        } else {
            setArgsState(disableLassoArgs);
        }
        setState(!state);
    }, [state]);

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
                    legend={{ visible: false }}
                />
            </div>
            <div style={{ textAlign: "center" }}>
                <div style={{ display: "inline" }}>Display lasso layer</div>
                <Switch
                    style={{ display: "inline" }}
                    checked={state}
                    onChange={handleChange}
                    color="primary"
                    name="checkedB"
                    inputProps={{ "aria-label": "primary checkbox" }}
                    title="display lasso layer"
                />
            </div>
        </>
    );
};

const disableLassoArgs = {
    id: "DeckGL-Map",
    resources: {
        wellsData: "./volve_wells.json",
    },
    bounds: [432205, 6475078, 437720, 6481113],
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
        },
        {
            "@@type": "LassoLayer",
            visible: false,
            data: "@@#resources.wellsData",
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

const enableLassoArgs = {
    ...disableLassoArgs,
    layers: [
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
        },
        {
            "@@type": "LassoLayer",
            visible: true,
            data: "@@#resources.wellsData",
        },
    ],
};
