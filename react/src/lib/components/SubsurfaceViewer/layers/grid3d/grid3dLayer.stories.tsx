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
};

const axes = {
    "@@type": "AxesLayer",
    id: "axes-layer2",
    bounds: [453150, 5925800, -2000, 469400, 5939500, 0],
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
            pointsUrl: "vtk-grid/Simgrid_points.json",
            polysUrl: "vtk-grid/Simgrid_polys.json",
            propertiesUrl: "vtk-grid/Simgrid_scalar.json",
        },
    ],
};
Simgrid.parameters = parameters;

export const Simgrid2x = Template.bind({});
Simgrid2x.args = {
    ...defaultProps,
    id: "grid-3d",
    layers: [
        axes,
        {
            ...grid3dLayer,
            pointsUrl: "vtk-grid/Simgrid2x_points.json",
            polysUrl: "vtk-grid/Simgrid2x_polys.json",
            propertiesUrl: "vtk-grid/Simgrid2x_scalar.json",
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
            pointsUrl: "vtk-grid/Simgrid4x_points.json",
            polysUrl: "vtk-grid/Simgrid4x_polys.json",
            propertiesUrl: "vtk-grid/Simgrid4x_scalar.json",
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
            pointsUrl: "vtk-grid/Simgrid8xIJonly_points.json",
            polysUrl: "vtk-grid/Simgrid8xIJonly_polys.json",
            propertiesUrl: "vtk-grid/Simgrid8xIJonly_scalar.json",
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
//     pointsUrl: "vtk-grid/intersection_points.json",
//     polysUrl: "vtk-grid/intersection_polys.json",
//     propertiesUrl: "vtk-grid/intersection_scalar.json",
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
