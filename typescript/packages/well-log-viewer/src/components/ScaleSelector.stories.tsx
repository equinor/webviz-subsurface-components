import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import ScaleSelector from "./ScaleSelector";
import type { ScaleSelectorProps } from "./ScaleSelector";

const ComponentCode = "<ScaleSelector value={1} max={128}/>";

const stories: Meta = {
    component: ScaleSelector,
    title: "WellLogViewer/Components/ScaleSelector",
    parameters: {
        docs: {
            description: {
                component:
                    "An auxiliary component for WellLogViewer/SyncLogViewer component. Used for setting a zoom factor to well log tracks",
            },
        },
        componentSource: {
            code: ComponentCode,
            language: "javascript",
        },
    },
    argTypes: {
        values: {
            description: "Available scale values array",
        },
        value: {
            description: "A value to show in the combobox",
        },
        onChange: {
            description: "A callback to recieve current value selected by user",
        },
        round: {
            description:
                'round the value to a "good" number (true for auto or number for rounding step)',
        },
    },
};
export default stories;

const Template = (args: ScaleSelectorProps) => {
    const infoRef = React.useRef<HTMLDivElement | null>(null);
    const setInfo = function (info: string): void {
        if (infoRef.current) infoRef.current.innerHTML = info;
    };

    return (
        <div>
            Scale:
            <ScaleSelector
                //id="ScaleSelector"
                {...args}
                onChange={function (value: number): void {
                    setInfo("scale value=" + value);
                }}
            />
            <div ref={infoRef}>&nbsp;</div>
        </div>
    );
};

export const Default: StoryObj<typeof Template> = {
    args: {
        value: 10000,
        round: true,
    },
    render: (args) => <Template {...args} />,
};
