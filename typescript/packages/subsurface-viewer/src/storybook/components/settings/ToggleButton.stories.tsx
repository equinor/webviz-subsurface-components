import React from "react";
import ToggleButton from "../../../components/settings/ToggleButton";

export default {
    component: ToggleButton,
    title: "SubsurfaceViewer/Components/Settings/Switch",
};

const Template = (args) => {
    return <ToggleButton {...args} />;
};

export const Default = Template.bind({});
Default.args = {
    label: "test",
};
