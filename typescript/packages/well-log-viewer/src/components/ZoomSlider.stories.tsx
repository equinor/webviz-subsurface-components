import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import ZoomSlider from "./ZoomSlider";

const ComponentCode = "<ZoomSlider value={1} max={128}/>";

const stories: Meta = {
    component: ZoomSlider,
    title: "WellLogViewer/Components/ZoomSlider",
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
        value: {
            description: "Zoom value (default 1)",
        },
        max: {
            description: "Max zoom value (default 256)",
        },
        onChange: {
            description: "zoom value callback",
        },
        step: {
            description: "zoom level step (default 0.5)",
        },
    },
};
export default stories;

// @ts-expect-error TS7006
const Template = (args) => {
    const infoRef = React.useRef();
    // @ts-expect-error TS7006
    const setInfo = function (info) {
        // @ts-expect-error TS2339
        if (infoRef.current) infoRef.current.innerHTML = info;
    };

    return (
        <div>
            <div style={{ width: "97%", height: "100%", flex: 1 }}>
                Zoom:
                <ZoomSlider
                    id="ZoomSlider"
                    {...args}
                    onChange={function (value: number): void {
                        setInfo("zoom value=" + value);
                    }}
                />
            </div>
            {/*
             // @ts-expect-error TS2322 */}
            <div ref={infoRef}>&nbsp;</div>
        </div>
    );
};

export const Default: StoryObj<typeof Template> = {
    args: {
        value: 1,
        max: 128,
    },
    render: (args) => <Template {...args} />,
};
