import React from "react";
import DeckGLMap from "../../DeckGLMap";

export default {
    component: DeckGLMap,
    title: "DeckGLMap / IntersectionView",
};

const DeckGLMapTemplate = (args) => {
    return <DeckGLMap {...args} />;
};

const data = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            geometry: {
                type: "GeometryCollection",
                geometries: [
                    {
                        type: "Point",
                        coordinates: [500, 2000, -400],
                    },
                    {
                        type: "LineString",
                        coordinates: [
                            [500, 2000, -400],
                            [1500, 2000, -600],
                            [1700, 2500, -400],
                        ],
                    },
                ],
            },
        },
    ],
};

// Sample data for intersection view
const sampleDataWellsLayer = {
    "@@type": "WellsLayer",
    id: "wells-layer",
    data: "@@#resources.wellsdata",
};

// Sample data for intersection view
const sampleDataExtendedPathLayer = {
    "@@type": "UnfoldedGeoJsonLayer",
    id: "enhanced-path-layer",
    data: "@@#resources.wellsdata",
    lineWidthScale: 20,
    lineBillboard: true,
};

const axes2 = {
    "@@type": "AxesLayer",
    id: "axes-layer",
    bounds: [0, 0, -1000, 2000, 3000, 0],
};

// Intersection view example
export const IntersectionView = DeckGLMapTemplate.bind({});
IntersectionView.args = {
    id: "DeckGLMap",
    bounds: [0, 0, 2000, 3000],
    layers: [axes2, sampleDataWellsLayer, sampleDataExtendedPathLayer],
    resources: { wellsdata: data },
    views: {
        layout: [1, 2],
        showLabel: true,
        viewports: [
            {
                id: "orbit_view",
                name: "3d view",
                show3D: true,
                layerIds: ["axes-layer", "wells-layer"],
            },
            {
                id: "intersection_view",
                name: "Intersection view",
                show3D: false,
                layerIds: ["axes-layer", "enhanced-path-layer"],
            },
        ],
    },
};
