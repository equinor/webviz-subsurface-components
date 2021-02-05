import { createStyles, makeStyles } from "@material-ui/core";
import { isEqual } from "lodash";
import React, { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { useResizeDetector } from "react-resize-detector";
import { WellCompletionsState } from "../../redux/store";
import { getRegexPredicate } from "../../utils/regex";
import { D3WellCompletions } from "./D3WellCompletions";
import { dataInTimeIndexRange } from "./dataUtil";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            display: "flex",
            flex: 1,
            height: "80%",
        },
    })
);
const WellCompletionsPlot: React.FC = () => {
    const classes = useStyles();
    // A reference to the div storing the plots
    const d3wellcompletions = useRef<D3WellCompletions>();
    const { width, height, ref } = useResizeDetector<HTMLDivElement>({
        refreshMode: "debounce",
        refreshRate: 100,
        refreshOptions: { trailing: true },
    });
    //Redux states
    const data = useSelector(
        (state: WellCompletionsState) => state.dataModel.data!
    );
    const timeIndexRange = useSelector(
        (state: WellCompletionsState) => state.ui.timeIndexRange,
        isEqual
    ) as [number, number];
    const rangeDisplayMode = useSelector(
        (state: WellCompletionsState) => state.ui.rangeDisplayMode
    );
    const hideZeroCompletions = useSelector(
        (state: WellCompletionsState) => state.ui.hideZeroCompletions
    );
    const filteredZones = useSelector(
        (state: WellCompletionsState) => state.ui.filteredZones
    );
    const wellSearchText = useSelector(
        (state: WellCompletionsState) => state.ui.wellSearchText
    );
    //Memo
    const filteredStratigraphy = useMemo(
        () =>
            data.stratigraphy.filter(
                zone => !filteredZones || filteredZones.includes(zone.name)
            ),
        [data.stratigraphy, filteredZones]
    );
    const wellNameRegex = useMemo(() => getRegexPredicate(wellSearchText), [
        wellSearchText,
    ]);
    const filteredWells = useMemo(
        () => data.wells.filter(well => wellNameRegex(well.name)),
        [data.wells, wellNameRegex]
    );

    const plotData = useMemo(
        () =>
            dataInTimeIndexRange(
                filteredStratigraphy,
                filteredWells,
                timeIndexRange,
                rangeDisplayMode,
                hideZeroCompletions
            ),
        [
            filteredStratigraphy,
            filteredWells,
            timeIndexRange,
            rangeDisplayMode,
            hideZeroCompletions,
        ]
    );

    // On mount
    useEffect(() => {
        if (!d3wellcompletions.current) {
            d3wellcompletions.current = new D3WellCompletions(
                ref.current as HTMLDivElement
            );
        }
    }, []);

    //Data changed
    useEffect(() => {
        if (d3wellcompletions.current) {
            d3wellcompletions.current.setPlotData(plotData);
        }
    }, [plotData]);
    //Resize
    useEffect(() => {
        if (
            d3wellcompletions.current &&
            width !== undefined &&
            height !== undefined
        ) {
            d3wellcompletions.current.resize(width, height);
        }
    }, [width, height]);
    // On unmount
    useEffect(() => {
        return () => d3wellcompletions.current?.clear();
    }, []);

    return <div className={classes.root} ref={ref} />;
};

export default WellCompletionsPlot;
