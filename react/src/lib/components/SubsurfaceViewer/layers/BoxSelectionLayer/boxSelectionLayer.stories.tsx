/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.
/* eslint-disable react-hooks/rules-of-hooks  */ // remove when ready to fix these.

import { FormControlLabel, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ComponentMeta, ComponentStory } from "@storybook/react";
// import { PickInfo } from "lib";
import React from "react";
import SubsurfaceViewer from "../../SubsurfaceViewer";

const PREFIX = "boxSelectionLayer";
type PickInfo = any;

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Box Selection Layer",
} as ComponentMeta<typeof SubsurfaceViewer>;

const classes = {
    main: `${PREFIX}-main`,
    legend: `${PREFIX}-legend`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")({
    [`& .${classes.main}`]: {
        height: 500,
        border: "1px solid black",
        position: "relative",
    },
    [`& .${classes.legend}`]: {
        width: 100,
        position: "absolute",
        top: "0",
        right: "0",
    },
});

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Box Selection Layer",
} as ComponentMeta<typeof SubsurfaceViewer>;

export const boxSelection: ComponentStory<typeof SubsurfaceViewer> = () => {
    const [argsState, setArgsState] =
        React.useState<Record<string, unknown>>(enableLassoArgs);
    const [state, setState] = React.useState<boolean>(true);

    const handleChange = React.useCallback(() => {
        const boxSelectionLayer = enableLassoArgs.layers.filter(
            (item) => item["@@type"] === "BoxSelectionLayer"
        );
        if (boxSelectionLayer[0].visible !== undefined) {
            boxSelectionLayer[0].visible = !boxSelectionLayer[0].visible;
        }
        if (boxSelectionLayer[0].visible) {
            setArgsState(enableLassoArgs);
        } else {
            setArgsState(disableLassoArgs);
        }
        setState(!state);
    }, [state]);

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer id={"DeckGL-Map"} {...argsState} />
            </div>
            <div style={{ textAlign: "center" }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={state}
                            onChange={handleChange}
                            color="primary"
                            name="checkedB"
                            inputProps={{ "aria-label": "primary checkbox" }}
                        />
                    }
                    label="Display Lasso Selection"
                />
            </div>
        </Root>
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
            "@@type": "BoxSelectionLayer",
            visible: false,
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
            "@@type": "BoxSelectionLayer",
            visible: true,
        },
    ],
};

export const boxSelectionWithCallback: ComponentStory<
    typeof SubsurfaceViewer
> = () => {
    const [data, setData] = React.useState<string[]>([]);
    const getSelectedWellsDataCallBack = React.useCallback(
        (pickingInfos: PickInfo[]) => {
            const selectedWells = pickingInfos
                .map((item) => item.object)
                .filter((item) => item.type === "Feature")
                .map((item) => item.properties["name"]) as string[];
            setData(selectedWells);
        },
        []
    );
    const lassoArgsWithSelectedWellsDataCallback: Record<string, unknown> = {
        ...disableLassoArgs,
        layers: [
            {
                "@@type": "WellsLayer",
                data: "@@#resources.wellsData",
            },
            {
                "@@type": "BoxSelectionLayer",
                visible: true,
                handleSelection: getSelectedWellsDataCallBack,
            },
        ],
    };
    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer
                    id={"DeckGL-Map"}
                    {...lassoArgsWithSelectedWellsDataCallback}
                />
            </div>
            <div>
                <div>Selected Wells:</div>
                {data.map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </div>
        </Root>
    );
};
