import { makeStyles } from "@material-ui/core";
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
    const [isLassoSelectionAvailable, setIsLassoSelectionAvailable] =
        React.useState<boolean>(false);
    const handleChange1 = () => {
        setIsLassoSelectionAvailable(true);
    };

    const handleChange2 = () => {
        setIsLassoSelectionAvailable(false);
    };
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);

    return (
        <>
            <div className={useStyles().main}>
                <DeckGLMap
                    {...args}
                    editedData={editedData}
                    setProps={(updatedProps) => {
                        setEditedData(updatedProps);
                    }}
                    isLassoSelectionAvailable={isLassoSelectionAvailable}
                />
            </div>
            <button onClick={handleChange1}> Enable Lasso Selection </button>
            <button onClick={handleChange2}> Disable Lasso Selection </button>
        </>
    );
};

lassoLayerTemplate.args = {
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
