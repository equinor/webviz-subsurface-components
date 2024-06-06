import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import Scroller from "./Scroller";

const ComponentCode =
    "const infoRef = React.useRef(); \r\n" +
    "const setInfo = function (info) { \r\n" +
    "    if (infoRef.current) infoRef.current.innerHTML = info; \r\n" +
    "}; \r\n" +
    "return ( \r\n" +
    '    <div style={{ height: "92vh" }}> \r\n' +
    "        <Scroller \r\n" +
    "            ref={(el) => { \r\n" +
    "                el.zoom(10, 10); \r\n" +
    "                el.scrollTo(0.2, 0.2); \r\n" +
    "            }} \r\n" +
    "            onScroll={(x, y) => { \r\n" +
    "                setInfo( \r\n" +
    '                    "Scroll position X=" + \r\n' +
    "                        x.toFixed(2) + \r\n" +
    '                        ", Y=" + \r\n' +
    "                        y.toFixed(2) \r\n" +
    "                ); \r\n" +
    "            }} \r\n" +
    "        > \r\n" +
    "            <div ref={infoRef}></div> \r\n" +
    "        </Scroller> \r\n" +
    "    </div> \r\n" +
    "); \r\n";

const stories: Meta = {
    component: Scroller,
    title: "WellLogViewer/Components/Scroller",
    parameters: {
        docs: {
            description: {
                component: "Auxiliary component to create scrolbars.",
            },
        },
        componentSource: {
            code: ComponentCode,
            language: "javascript",
        },
    },
    argTypes: {
        onScroll: {
            description: "Callback with new scroll positions",
        },
    },
};
export default stories;

const Template = (args) => {
    const infoRef = React.useRef();
    const setInfo = function (info) {
        if (infoRef.current) infoRef.current.innerHTML = info;
    };
    return (
        <div style={{ height: "92vh" }}>
            <Scroller
                ref={(el) => {
                    el.zoom(10, 10);
                    el.scrollTo(0.2, 0.2);
                }}
                onScroll={(x, y) => {
                    setInfo(
                        "Scroll position X=" +
                            x.toFixed(2) +
                            ", Y=" +
                            y.toFixed(2)
                    );
                    args.onScroll?.(x, y); // for storybook addon Actions Tab
                }}
            >
                <div ref={infoRef}></div>
            </Scroller>
        </div>
    );
};

export const Default: StoryObj<typeof Template> = {
    args: {},
    render: (args) => <Template {...args} />,
};
