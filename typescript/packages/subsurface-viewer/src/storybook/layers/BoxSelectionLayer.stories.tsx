import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import type { PickingInfo } from "@deck.gl/core/typed";

import { styled } from "@mui/material/styles";

import SubsurfaceViewer from "../../SubsurfaceViewer";
import WellsLayer from "../../layers/wells/wellsLayer";
import BoxSelectionLayer from "../../layers/BoxSelectionLayer/boxSelectionLayer";

import { volveWellsBounds } from "../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer / Box Selection Layer",
    args: {
        // Add a reset button for all the stories.
        // Somehow, I do not manage to add the triggerHome to the general "unset" controls :/
        triggerHome: 0,
    },
};
export default stories;

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
    bounds: volveWellsBounds,
    layers: [wellsLayer, boxSelectionLayer],
};

type BoxSelectionComponentProps = {
    triggerHome: number;
    enableSelection: boolean;
};
const BoxSelectionComponent: React.FC<BoxSelectionComponentProps> = ({
    triggerHome,
    enableSelection,
}: BoxSelectionComponentProps) => {
    const deckProps = React.useMemo(
        () => ({
            ...DECK_PROPS,
            triggerHome,
            layers: [
                wellsLayer,
                new BoxSelectionLayer({
                    layerIds: ["wells"],
                    visible: enableSelection,
                }),
            ],
        }),
        [enableSelection, triggerHome]
    );

    return (
        <Root>
            <div className={classes.main}>
                <SubsurfaceViewer {...deckProps} />
            </div>
        </Root>
    );
};

export const BoxSelection: StoryObj<typeof BoxSelectionComponent> = {
    args: {
        enableSelection: true,
    },
    render: (args) => <BoxSelectionComponent {...args} />,
};

const BoxSelectionWithCallbackComponent: React.FC = () => {
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

export const BoxSelectionWithCallback: StoryObj<
    typeof BoxSelectionWithCallbackComponent
> = {
    render: () => <BoxSelectionWithCallbackComponent />,
};
