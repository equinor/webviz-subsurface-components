import { NativeSelect } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateRangeDisplayMode } from "../../redux/reducer";
import { WellCompletionsState } from "../../redux/store";
import { RangeModes } from "../../redux/types";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            maxWidth: "120px",
        },
    })
);

const RangeDisplayModeSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    const rangeDisplayMode = useSelector(
        (st: WellCompletionsState) => st.ui.rangeDisplayMode
    );
    // handlers
    const handleSelectedItemChange = useCallback(
        event => dispatch(updateRangeDisplayMode(event.target.value)),
        [dispatch]
    );
    return (
        <NativeSelect
            className={classes.root}
            id="range-display-mode-selector"
            label="Range Display Mode"
            value={rangeDisplayMode}
            onChange={handleSelectedItemChange}
        >
            {Object.keys(RangeModes).map(mode => (
                <option key={mode}>{mode}</option>
            ))}
        </NativeSelect>
    );
});

RangeDisplayModeSelector.displayName = "RangeDisplayModeSelector";
export default RangeDisplayModeSelector;
