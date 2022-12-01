import { FormControlLabel, makeStyles, Switch } from "@material-ui/core";
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

export const lassoSelection: ComponentStory<typeof DeckGLMap> = (args) => {
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
        },
    ],
};

export const lassoSelectionWithCallback: ComponentStory<
    typeof DeckGLMap
> = () => {
    const [data, setData] = React.useState<string[]>([]);
    const getSelectedWellsDataCallBack = React.useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pickingInfos: any[]) => {
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
                "@@type": "LassoLayer",
                visible: true,
                getSelectedWellsData: getSelectedWellsDataCallBack,
            },
        ],
    };
    return (
        <>
            <div className={useStyles().main}>
                <DeckGLMap
                    id={"DeckGL-Map"}
                    {...lassoArgsWithSelectedWellsDataCallback}
                    legend={{ visible: false }}
                />
            </div>
            <div>
                {data.map((item) => (
                    <div key={item}>{item}</div>
                ))}
            </div>
        </>
    );
};
