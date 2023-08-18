import React from "react";
import { WellCompletionsPlot } from "./WellCompletionsPlot";
import type { PlotData } from "./index";

import {
    timeSteps,
    firstPlotData,
    secondPlotData,
    thirdPlotData,
} from "../example-data/well-completions-plot-data";

/**
 * Storybook test for the well completions plot component
 */
export default {
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

const Template = (data) => {
    const [plotData, setPlotData] = React.useState<PlotData>(data.plotData);
    const [timeSteps, setTimeSteps] = React.useState<string[]>(data.timeSteps);

    const [prevData, setPrevData] = React.useState(data);
    if (data !== prevData) {
        setPrevData(data);
        setPlotData(data.plotData);
        setTimeSteps(data.timeSteps);
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
                    timeSteps={timeSteps}
                />
            </div>
        </>
    );
};
export const WellCompletionsPlotStory = Template.bind({});

//Inject test input data
WellCompletionsPlotStory.args = {
    plotData: firstPlotData,
    timeSteps: timeSteps,
};
