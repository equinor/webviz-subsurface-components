/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.
/* eslint-disable react-hooks/rules-of-hooks  */ // remove when ready to fix these.

import { styled } from "@mui/material/styles";
import type { Meta } from "@storybook/react";
import React from "react";
import SubsurfaceViewer from "../../SubsurfaceViewer";
import type { PickingInfo } from "@deck.gl/core/typed";
import WellsLayer from "../wells/wellsLayer";
import BoxSelectionLayer from "./boxSelectionLayer";

const PREFIX = "boxSelectionLayer";

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

const boxSelectionLayer = new BoxSelectionLayer({
    visible: true,
    layerIds: ["wells"],
});

const wellsLayer = new WellsLayer({
    id: "wells",
    data: "./volve_wells.json",
});

const DECK_PROPS = {
    id: "DeckGL-Map",
    bounds: [432205, 6475078, 437720, 6481113] as [
        number,
        number,
        number,
        number,
    ],
    layers: [wellsLayer, boxSelectionLayer],
};

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Box Selection Layer",
} as Meta;

export const boxSelection = ({
    enableSelection,
}: {
    enableSelection: boolean;
}) => {
    const deckProps = React.useMemo(
        () => ({
            ...DECK_PROPS,
            layers: [
                wellsLayer,
                new BoxSelectionLayer({
                    layerIds: ["wells"],
                    visible: enableSelection,
                }),
            ],
        }),
        [enableSelection]
    );

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...deckProps} />
            </div>
        </Root>
    );
};

boxSelection.args = {
    enableSelection: true,
};

export const boxSelectionWithCallback = () => {
    const [data, setData] = React.useState<string[]>([]);
    const getSelectedWellsDataCallBack = React.useCallback(
        (pickingInfos: PickingInfo[]) => {
            const selectedWells = pickingInfos
                .map((item) => item.object)
                .filter((item) => item.type === "Feature")
                .map((item) => item.properties["name"]) as string[];
            setData(selectedWells);
        },
        []
    );
    const lassoArgsWithSelectedWellsDataCallback: Record<string, unknown> = {
        ...DECK_PROPS,
        layers: [
            wellsLayer,
            new BoxSelectionLayer({
                visible: true,
                handleSelection: getSelectedWellsDataCallBack,
                layerIds: ["wells"],
            }),
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
                <ol>
                    {data.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ol>
            </div>
        </Root>
    );
};
