import { NativeSelect } from "@equinor/eds-core-react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentIteration } from "../../redux/actions";
import { GroupTreeState } from "../../redux/store";
import { DataContext } from "../DataLoader";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            minWidth: "170px",
            maxWidth: "170px",
            padding: theme.spacing(1),
        },
    })
);

const IterationSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    const data = useContext(DataContext);
    // Redux
    const dispatch = useDispatch();
    const currentIteration = useSelector(
        (st: GroupTreeState) => st.ui.currentIteration
    );
    const currentDateTime = useSelector(
        (st: GroupTreeState) => st.ui.currentDateTime
    );
    const iterations = useMemo(
        () => Array.from(Object.keys(data.iterations)),
        [data]
    );
    // handlers
    const handleSelectedItemChange = useCallback(
        (event) => {
            const newDateTimes = data.iterations[event.target.value].trees;
            const newDateTime =
                currentDateTime in newDateTimes
                    ? currentDateTime
                    : Object.keys(newDateTimes)[0];
            dispatch(updateCurrentIteration([event.target.value, newDateTime]));
        },
        [dispatch, data, currentDateTime]
    );
    return (
        <NativeSelect
            className={classes.root}
            id="iteration-selector"
            label="Current Iteration"
            value={currentIteration}
            onChange={handleSelectedItemChange}
        >
            {iterations.map((mode) => (
                <option key={mode}>{mode}</option>
            ))}
        </NativeSelect>
    );
});

IterationSelector.displayName = "IterationSelector";
export default IterationSelector;
