import { Switch } from "@equinor/eds-core-react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateHideZeroCompletions } from "../../redux/reducer";
import { WellCompletionsState } from "../../redux/store";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            margin: theme.spacing(1),
        },
    })
);
const HideZeroCompletionsSwitch: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    const hideZeroCompletions = useSelector(
        (st: WellCompletionsState) => st.ui.hideZeroCompletions
    );
    // handlers
    const handleSwitchChange = useCallback(
        event => dispatch(updateHideZeroCompletions(event.target.checked)),
        [dispatch]
    );
    return (
        <Switch
            className={classes.root}
            label="Filter by completions"
            size="small"
            enterKeyHint="Only show wells completed in at least one of the selected layers"
            onChange={handleSwitchChange}
            checked={hideZeroCompletions}
        />
    );
});

HideZeroCompletionsSwitch.displayName = "HideZeroCompletionsSwitch";
export default HideZeroCompletionsSwitch;
