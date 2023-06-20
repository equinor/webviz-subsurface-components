import React from "react";
import exampleData from "../../../../../../demo/example-data/deckgl-map.json";
import SubsurfaceViewer from "../../../SubsurfaceViewer";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Components/ColorLegends/IndividualScaleForMap",
};

// Template for when edited data needs to be captured.
const EditDataTemplate = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);
    return (
        <SubsurfaceViewer
            {...args}
            editedData={editedData}
            setProps={(updatedProps) => {
                setEditedData(updatedProps.editedData);
            }}
        />
    );
};

// 4 maps with individual color scales for each map
export const IndividualScaleForMap = EditDataTemplate.bind({});
IndividualScaleForMap.args = {
    ...exampleData[0],
    legend: {
        visible: true,
    },
    zoom: -5,
    layers: [
        exampleData[0].layers[0],
        {
            ...exampleData[0].layers[0],
            colorMapRange: [3000, 3100],
            valueRange: [3000, 3100],
            id: "colormap-2-layer",
            colorMapName: "Porosity",
        },
        {
            ...exampleData[0].layers[0],
            colorMapRange: [3000, 3100],
            valueRange: [3000, 3100],
            id: "colormap-3-layer",
            colorMapName: "Permeability",
        },
        {
            ...exampleData[0].layers[0],
            colorMapRange: [3000, 3100],
            valueRange: [3000, 3100],
            id: "colormap-4-layer",
            colorMapName: "Seismic",
        },
    ],
    views: {
        layout: [2, 2],
        showLabel: true,
        viewports: [
            {
                id: "view_1",
                name: "Colormap 1 layer",
                show3D: false,
                layerIds: ["colormap-layer"],
            },
            {
                id: "view_2",
                name: "Colormap 2 layer",
                show3D: false,
                layerIds: ["colormap-2-layer"],
            },
            {
                id: "view_3",
                name: "Colormap 3 layer",
                show3D: false,
                layerIds: ["colormap-3-layer"],
            },
            {
                id: "view_4",
                name: "Colormap 4 layer",
                show3D: false,
                layerIds: ["colormap-4-layer"],
            },
        ],
    },
};

IndividualScaleForMap.parameters = {
    docs: {
        description: {
            story: "Four maps with individual color scales for each map",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};
