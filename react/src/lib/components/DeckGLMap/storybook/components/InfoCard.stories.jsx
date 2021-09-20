import React from "react";
import InfoCard from "../../components/InfoCard";

export default {
    component: InfoCard,
    title: "DeckGLMap/Components/InfoCard",
};

const Template = (args) => <InfoCard {...args} />;

export const SingleProperty = Template.bind({});
SingleProperty.args = {
    pickInfos: [
        {
            x: 152,
            y: 254,
            radius: 1,
            depth: 638,
            coordinate: [111, 222],
        },
    ],
};

export const MutipleProperties = Template.bind({});
MutipleProperties.args = {
    pickInfos: [
        {
            x: 152,
            y: 254,
            radius: 1,
            depth: 638,
            coordinate: [111, 222],
        },
        {
            layer: { id: "wells-layer" },
            property: { name: "Poro WellA", value: 123 },
        },
    ],
};
