import React from "react";
import Scroller from "./Scroller";

const ComponentCode = "<Scroller><div>Hello world!</div></Scroller>";

export default {
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
                }}
                onScroll={(x, y) => {
                    setInfo(
                        "Scroll position X=" +
                            x.toFixed(3) +
                            ", Y=" +
                            y.toFixed(3)
                    );
                }}
                {...args}
            >
                <div ref={infoRef}></div>
            </Scroller>
        </div>
    );
};

export const Default = Template.bind({});
