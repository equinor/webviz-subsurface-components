import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import SubsurfaceViewer from "../../SubsurfaceViewer";

export default {
    component: SubsurfaceViewer,
    title: "SubsurfaceViewer/Experimental Grid3D",
} as ComponentMeta<typeof SubsurfaceViewer>;

type NumberQuad = [number, number, number, number];

const Template: ComponentStory<typeof SubsurfaceViewer> = (args) => (
    <SubsurfaceViewer {...args} />
);

const defaultProps = {
    bounds: [456150, 5925800, 467400, 5939500] as NumberQuad,
    views: {
        layout: [1, 1] as [number, number],
        viewports: [
            {
                id: "view_1",
                show3D: true,
            },
        ],
    },
};

// Grid 3d story
const grid3dLayer = {
    "@@type": "Grid3DLayer",
    id: "Grid3DLayer",
    material: true,
    colorMapName: "Rainbow",
    ZIncreasingDownwards: false,
};

const axes = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [453150, 5925800, 0, 469400, 5939500, 2000],
};
const parameters = {
    docs: {
        description: {
            story: "Simgrid.",
        },
        inlineStories: false,
        iframeHeight: 500,
    },
};

export const Simgrid = Template.bind({});
Simgrid.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [
        axes,
        {
            ...grid3dLayer,
            pointsData: "vtk-grid/Simgrid_points.json",
            polysData: "vtk-grid/Simgrid_polys.json",
            propertiesData: "vtk-grid/Simgrid_scalar.json",
        },
    ],
};
Simgrid.parameters = parameters;

export const SimgridArrayInput = Template.bind({});
SimgridArrayInput.args = {
    ...defaultProps,
    id: "grid-3darray",
    layers: [
        axes,
        {
            ...grid3dLayer,
            pointsData: [
                456063, 5935991, -1729, 456063, 5935991, -1731, 456138,
                5935861.518843642, -1727.820068359375, 456138.5, 5935861.5,
                -1726.3526611328125, 456193.90625, 5936066, -1730.7259521484375,
                456193.8825946293, 5936065.981075703, -1732.200439453125,
                456268.9375, 5935936.5, -1726.6915283203125,
            ],
            polysData: [4, 0, 1, 2, 3, 4, 0, 4, 5, 1, 4, 0, 3, 6, 4],
            propertiesData: [0.2, 0.6, 0.8],
        },
    ],
};
SimgridArrayInput.parameters = parameters;

export const Simgrid2x = Template.bind({});
Simgrid2x.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [
        axes,
        {
            ...grid3dLayer,
            pointsData: "vtk-grid/Simgrid2x_points.json",
            polysData: "vtk-grid/Simgrid2x_polys.json",
            propertiesData: "vtk-grid/Simgrid2x_scalar.json",
        },
    ],
};
Simgrid2x.parameters = parameters;

export const Simgrid4x = Template.bind({});
Simgrid4x.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [
        axes,
        {
            ...grid3dLayer,
            pointsData: "vtk-grid/Simgrid4x_points.json",
            polysData: "vtk-grid/Simgrid4x_polys.json",
            propertiesData: "vtk-grid/Simgrid4x_scalar.json",
        },
    ],
};
Simgrid4x.parameters = parameters;

export const Simgrid8xIJonly = Template.bind({});
Simgrid8xIJonly.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [
        axes,
        {
            ...grid3dLayer,
            pointsData: "vtk-grid/Simgrid8xIJonly_points.json",
            polysData: "vtk-grid/Simgrid8xIJonly_polys.json",
            propertiesData: "vtk-grid/Simgrid8xIJonly_scalar.json",
        },
    ],
};
Simgrid8xIJonly.parameters = parameters;

// // Intersection story.
// const intersection_axes = {
//     "@@type": "AxesLayer",
//     id: "axes-layer2",
//     bounds: [463256, 5930542.5, -9060, 464465, 5932768, -7999],
// };

// const intersection = {
//     "@@type": "Grid3DLayer",
//     id: "Grid3DLayer",
//     pointsData: "vtk-grid/intersection_points.json",
//     polysData: "vtk-grid/intersection_polys.json",
//     propertiesData: "vtk-grid/intersection_scalar.json",
//     material: true,
//     colorMapName: "Rainbow",
//     scaleZ: 5,
// };

// export const Intersection = Template.bind({});
// Intersection.args = {
//     ...defaultProps,
//     id: "grid-3d",
//     layers: [intersection_axes, intersection],
// };

// Intersection.parameters = {
//     docs: {
//         description: {
//             story: "3D grid intersection geometry using vtk polydata format.",
//         },
//         inlineStories: false,
//         iframeHeight: 500,
//     },
// };
