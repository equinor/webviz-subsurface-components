import { colorTables } from "@emerson-eps/color-tables";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { expect, fn, waitFor } from "storybook/test";
import type { Template as TemplateType } from "./WellLogTemplateTypes";
import WellLogViewWithScroller, {
    argTypesWellLogViewWithScrollerProp,
} from "./WellLogViewWithScroller";
import type { WellLogController } from "./WellLogView";
import type { WellLogViewWithScrollerProps } from "./WellLogViewWithScroller";

import { axisTitles, axisMnemos } from "../utils/axes";
import type { ColormapFunction } from "../utils/color-function";

import wellLog898MudJson from "../../../../../example-data/L898MUD.json";
import templateJson1 from "../../../../../example-data/welllog_template_1.json";

const exampleColormapFunctions = colorTables as ColormapFunction[];

const ComponentCode =
    '<WellLogViewWithScroller id="WellLogViewWithScroller" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../../../example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../../../example-data/welllog_template_1.json")} \r\n' +
    "    colorMapFunctions={exampleColormapFunctions} \r\n" +
    "/>";

const stories: Meta<WellLogViewWithScrollerProps> = {
    component: WellLogViewWithScroller,
    title: "WellLogViewer/Components/WellLogViewWithScroller",
    tags: ["no-screenshot-test"],
    parameters: {
        docs: {
            description: {
                component:
                    "The component add scrollbars to WellLogView component to make tracks and plots scrollable by scrollbars.",
            },
        },
        componentSource: {
            code: ComponentCode,
            language: "javascript",
        },
    },
    args: {
        // must be explicitly set starting storybook V 8
        onCreateController: fn(),
        onInfo: fn(),
        onTrackScroll: fn(),
        onTrackSelection: fn(),
        onContentRescale: fn(),
        onContentSelection: fn(),
    },
    argTypes: argTypesWellLogViewWithScrollerProp,
};
export default stories;

const Template = (args: WellLogViewWithScrollerProps) => {
    return (
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ width: "100%", height: "100%" }}>
                <WellLogViewWithScroller
                    id="WellLogViewWithScroller"
                    {...args}
                    // Storybook 9 is very slow to parse huge JSON args.
                    // Move the wellLogSets from the arguments to inline to speed up storybook.
                    // See SyncLogViewer.stories.tsx as an example to handle multiple stories.
                    wellLogSets={wellLog898MudJson}
                />
            </div>
        </div>
    );
};

export const Default: StoryObj<typeof Template> = {
    args: {
        horizontal: false,
        template: templateJson1 as TemplateType,
        viewTitle: "Well '" + wellLog898MudJson[0].header.well + "'",
        colorMapFunctions: exampleColormapFunctions,
        axisTitles,
        axisMnemos,
        options: {
            checkDatafileSchema: true,
        },
    },
    render: (args) => <Template {...args} />,
};

export const ScrollbarBehavior: StoryObj<typeof Template> = {
    args: {
        ...Default.args,
        onCreateController: (controller: WellLogController): void => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => controller.zoomContent(2));
            });
        },
    },
    render: (args) => <Template {...args} />,
    parameters: {
        docs: {
            description: {
                story: "Uses the real well log viewer with enough content zoom to exercise horizontal and vertical scrolling.",
            },
        },
    },
    play: async ({ canvasElement }) => {
        const scroller = canvasElement.querySelector<HTMLDivElement>(
            'div[style*="overflow: scroll"]'
        );

        await waitFor(() => {
            if (!scroller) {
                throw new Error("Well log scroller was not rendered");
            }
            expect(scroller.scrollWidth).toBeGreaterThan(scroller.clientWidth);
            expect(scroller.scrollHeight).toBeGreaterThan(
                scroller.clientHeight
            );
        });

        if (!scroller) {
            throw new Error("Well log scroller was not rendered");
        }

        scroller.scrollLeft = scroller.scrollWidth - scroller.clientWidth;
        scroller.scrollTop = scroller.scrollHeight - scroller.clientHeight;

        await waitFor(() => {
            expect(scroller.scrollLeft).toBeGreaterThan(0);
            expect(scroller.scrollTop).toBeGreaterThan(0);
        });
    },
};
