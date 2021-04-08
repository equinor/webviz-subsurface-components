import React from "react";
import { exampleData } from "./test/storybookDataDecorator";
import WellCompletions from "./WellCompletions";

export default {
    component: WellCompletions,
    title: "WellCompletions/Demo",
    argTypes: {
        data: {
            control: {
                type: "object",
            },
        },
    },
};

const Template = (data) => <WellCompletions data={data.data} id={"test"} />;
export const WellCompletion = Template.bind({});

WellCompletion.args = {
    data: exampleData,
};
