import type { Meta, StoryObj } from "@storybook/react";
import React from "react";

import { WellCompletionsPlot } from "./WellCompletionsPlot";
import type { PlotData } from "./index";

import {
    sortedCompletionDates,
    firstPlotData,
    secondPlotData,
    thirdPlotData,
} from "../example-data/well-completions-plot-data";

/**
 * Storybook test for the well completions plot component
 */
const stories: Meta = {
    component: WellCompletionsPlot,
    title: "WellCompletionsPlot/Demo",
    argTypes: {
        data: {
            control: {
                type: "object",
            },
        },
    },
};
export default stories;

// @ts-expect-error TS7006
const Template = (data) => {
    const [plotData, setPlotData] = React.useState<PlotData>(data.plotData);
    const [sortedCompletionDates, setSortedCompletionDates] = React.useState<
        string[]
    >(data.sortedCompletionDates);

    const [prevData, setPrevData] = React.useState(data);
    if (data !== prevData) {
        setPrevData(data);
        setPlotData(data.plotData);
        setSortedCompletionDates(data.sortedCompletionDates);
    }

    const handleFirstButtonClick = () => {
        setPlotData(firstPlotData);
    };
    const handleSecondButtonClick = () => {
        setPlotData(secondPlotData);
    };
    const handleThirdButtonClick = () => {
        setPlotData(thirdPlotData);
    };

    return (
        <>
            <button type="button" onClick={() => handleFirstButtonClick()}>
                First plot data
            </button>
            <button type="button" onClick={() => handleSecondButtonClick()}>
                Second plot data
            </button>
            <button type="button" onClick={() => handleThirdButtonClick()}>
                Third plot data
            </button>
            <div
                style={{
                    minWidth: "500px",
                    minHeight: "300px",
                    height: "100vh",
                }}
            >
                <WellCompletionsPlot
                    id={"test"}
                    plotData={plotData}
                    sortedCompletionDates={sortedCompletionDates}
                />
            </div>
        </>
    );
};
export const WellCompletionsPlotStory: StoryObj<typeof Template> = {
    args: {
        plotData: firstPlotData,
        sortedCompletionDates: sortedCompletionDates,
    },
    render: (args) => <Template {...args} />,
};
