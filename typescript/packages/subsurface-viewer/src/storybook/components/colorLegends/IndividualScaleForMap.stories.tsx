import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { View } from "@deck.gl/core";

import { ColorLegend } from "@emerson-eps/color-tables";

import SubsurfaceViewer from "../../../SubsurfaceViewer";

import {
    colormapLayer,
    defaultStoryParameters,
    subsufaceProps,
} from "../../sharedSettings";

const stories: Meta = {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Components/ColorLegends",
};
export default stories;

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
        >
            <>
                {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    /* @ts-expect-error */
                    <View id="view_1">
                        <ColorLegend
                            min={3000}
                            max={3100}
                            horizontal={true}
                            dataObjectName={"Rainbow"}
                            colorName={"Rainbow"}
                        />
                    </View>
                }
                {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    /* @ts-expect-error */
                    <View id="view_2">
                        <ColorLegend
                            min={3000}
                            max={3100}
                            horizontal={true}
                            dataObjectName={"Porosity"}
                            colorName={"Porosity"}
                        />
                    </View>
                }
                {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    /* @ts-expect-error */
                    <View id="view_3">
                        <ColorLegend
                            min={3000}
                            max={3100}
                            horizontal={true}
                            dataObjectName={"Permeability"}
                            colorName={"Permeability"}
                        />
                    </View>
                }
                {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    /* @ts-expect-error */
                    <View id="view_4">
                        <ColorLegend
                            min={3000}
                            max={3100}
                            horizontal={true}
                            dataObjectName={"Seismic"}
                            colorName={"Seismic"}
                        />
                    </View>
                }
            </>
        </SubsurfaceViewer>
    );
};

// 4 maps with individual color scales for each map
export const IndividualScaleForMap: StoryObj<typeof SubsurfaceViewer> = {
    name: "Individual ContinuousLegend",
    args: {
        ...subsufaceProps,
        layers: [
            colormapLayer,
            {
                ...colormapLayer,
                colorMapRange: [3000, 3100],
                valueRange: [3000, 3100],
                id: "colormap-2-layer",
                colorMapName: "Porosity",
            },
            {
                ...colormapLayer,
                colorMapRange: [3000, 3100],
                valueRange: [3000, 3100],
                id: "colormap-3-layer",
                colorMapName: "Permeability",
            },
            {
                ...colormapLayer,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    parameters: {
        docs: {
            ...defaultStoryParameters.docs,
            description: {
                story: "Four maps with individual color scales for each map",
            },
        },
    },
    render: (args) => <EditDataTemplate {...args} />,
};
