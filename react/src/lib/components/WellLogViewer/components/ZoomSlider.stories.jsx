import React from "react";
import ZoomSlider from "./ZoomSlider";

export default {
    component: ZoomSlider,
    title: "WellLogViewer/Components/ZoomSlider",
    argTypes: {
        value: {
            description: "Zoom value",
            defaultValue: 1,
        },
        max: {
            description: "Max zoom value",
            defaultValue: 256,
        },
        onChange: {
            description: "zoom value callback",
        },
        step: {
            description: "zoom level step",
            defaultValue: 0.5,
        },
    },
};

const Template = (args) => {
    return (
        <div style={{ height: "92vh" }}>
            <div style={{ width: "97%", height: "100%", flex: 1 }}>
                Zoom:
                <ZoomSlider id="ZoomSlider" {...args} />
            </div>
        </div>
    );
};

export const Default = Template.bind({});
Default.args = {
    value: 1,
    max: 128,
};
