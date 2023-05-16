import { styled } from "@mui/material/styles";
import React, { useMemo } from "react";
import { useResizeDetector } from "react-resize-detector";
import { PlotData } from "../../utils/dataUtil";
import { TooltipProvider } from "../Common/TooltipProvider";
import CompletionsPlot from "./CompletionsPlot";
import { getLayout, Padding } from "./plotUtil";
import StratigraphyPlot from "./StratigraphyPlot";
import WellsPlot from "./WellsPlot";

const PREFIX = "WellCompletionsPlot";

const classes = {
    root: `${PREFIX}-root`,
};

const StyledTooltipProvider = styled(TooltipProvider)(({ theme }) => ({
    [`& .${classes.root}`]: {
        display: "flex",
        flex: 1,
        height: "80%",
        padding: theme.spacing(1),
    },
}));

interface Props {
    timeSteps: string[];
    plotData: PlotData;
}

const padding: Padding = { left: 80, right: 50, top: 70, bottom: 50 };
/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
const WellCompletionsPlot: React.FC<Props> = React.memo(
    ({ timeSteps, plotData }) => {
        const { width, height, ref } = useResizeDetector({
            refreshMode: "debounce",
            refreshRate: 50,
            refreshOptions: { trailing: true },
        });
        const layout = useMemo(
            () =>
                width !== undefined && height !== undefined
                    ? getLayout(width, height, padding)
                    : undefined,
            [width, height]
        );

        return (
            <StyledTooltipProvider>
                <div
                    className={classes.root}
                    ref={ref as React.LegacyRef<HTMLDivElement>}
                    data-tip
                    data-for="plot-tooltip"
                >
                    {layout && (
                        <svg
                            id={"svg-context"}
                            width={width}
                            height={height}
                            style={{ position: "relative" }}
                        >
                            <StratigraphyPlot
                                data={plotData.stratigraphy}
                                layout={layout}
                                padding={padding}
                            />
                            <WellsPlot
                                timeSteps={timeSteps}
                                plotData={plotData}
                                layout={layout}
                                padding={padding}
                            />
                            <CompletionsPlot
                                plotData={plotData}
                                layout={layout}
                                padding={padding}
                            />
                        </svg>
                    )}
                </div>
            </StyledTooltipProvider>
        );
    }
);

WellCompletionsPlot.displayName = "WellCompletionsPlot";
export default WellCompletionsPlot;
