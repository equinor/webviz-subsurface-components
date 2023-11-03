import React from "react";
import LayerSettingsButton from "../../../components/settings/LayerSettingsButton";

export default {
    component: LayerSettingsButton,
    title: "SubsurfaceViewer/Components/Settings/LayerSettingsButton",
};

// Note: Disabled for now will be fixed later. Missing redux context.

// const Template = (args) => {
//     return <LayerSettingsButton layer={args.layer} />;
// };

// export const DrawingSettings = Template.bind({});
// DrawingSettings.args = {
//     layer: {
//         name: "Drawing",
//         "@@type": "DrawingLayer",
//         id: "drawing-layer",
//         visible: true,
//         mode: "drawLineString",
//     },
// };

// export const WellsSettings = Template.bind({});
// WellsSettings.args = {
//     layer: {
//         name: "Wells",
//         "@@type": "WellsLayer",
//         id: "wells-layer",
//         opacity: 1,
//         pointRadiusScale: 8,
//         visible: true,
//     },
// };
