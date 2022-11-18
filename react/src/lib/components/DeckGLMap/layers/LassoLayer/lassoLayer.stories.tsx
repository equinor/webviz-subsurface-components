import { makeStyles } from "@material-ui/core";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { exampleData } from "../../../../../demo/example-data/deckgl-map.json";
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
    const [triggerResetMultipleWells, setTriggerResetMultipleWells] =
        React.useState<number>(0);
    const handleChange1 = () => {
        setTriggerResetMultipleWells(triggerResetMultipleWells + 1);
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
                    triggerResetMultipleWells={triggerResetMultipleWells}
                />
            </div>
            <button onClick={handleChange1}> Reset Multiple Wells </button>
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
            "@@type": "ColormapLayer",
            image: "@@#resources.propertyMap",
            rotDeg: 0,
            bounds: [432205, 6475078, 437720, 6481113],
            colorMapName: "Rainbow",
            valueRange: [2782, 3513],
            colorMapRange: [2782, 3513],
        },
        {
            "@@type": "Hillshading2DLayer",
            bounds: [432205, 6475078, 437720, 6481113],
            valueRange: [2782, 3513],
            rotDeg: 0,
            image: "@@#resources.depthMap",
        },
        {
            "@@type": "GridLayer",
            id: "grid-layer",
            data: "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/grid_layer.json",
            colorMapName: "Rainbow",
            valueRange: [0, 1],
            colorMapRange: [0, 1],
            visible: false,
        },
        {
            "@@type": "Map3DLayer",
            bounds: [432205, 6475078, 437720, 6481113],
            meshMaxError: 5.0,
            mesh: "hugin_depth_25_m_normalized_margin.png",
            meshValueRange: [2782, 3513],
            propertyTexture: "kh_netmap_25_m_normalized_margin.png",
            propertyValueRange: [2782, 3513],
            rotDeg: 0,
            contours: [0, 50.0],
            isContoursDepth: true,
            colorMapName: "Physics",
            colorMapRange: [2782, 3513],
            visible: false,
        },
        {
            "@@type": "WellsLayer",
            data: "@@#resources.wellsData",
            logData: "@@#resources.logData",
            logrunName: "BLOCKING",
            logName: "ZONELOG",
            logColor: "Stratigraphy",
        },
        {
            "@@type": "FaultPolygonsLayer",
            data: "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/fault_polygons.geojson",
        },
        {
            "@@type": "PieChartLayer",
            data: "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/piechart.json",
        },
        {
            "@@type": "DrawingLayer",
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
