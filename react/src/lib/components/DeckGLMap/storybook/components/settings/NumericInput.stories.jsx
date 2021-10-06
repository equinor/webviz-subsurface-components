import React from "react";
import NumericInput from "../../../components/settings/NumericInput";

export default {
    component: NumericInput,
    title: "DeckGLMap/Components/Settings/NumericInput",
};

const Template = (args) => {
    return <NumericInput {...args} />;
};

export const Default = Template.bind({});
Default.args = {
    label: "test",
    value: 5,
};
