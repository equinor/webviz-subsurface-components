import { Switch } from "@equinor/eds-core-react";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateHideZeroCompletions } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";
/**
 * A switch for showing/hiding wells with zero completion
 */
const HideZeroCompletionsSwitch: React.FC = React.memo(() => {
    // Redux
    const dispatch = useDispatch();
    const hideZeroCompletions = useSelector(
        (st: WellCompletionsState) => st.ui.hideZeroCompletions
    );

    // Handlers
    const handleSwitchChange = useCallback(
        (event) => dispatch(updateHideZeroCompletions(event.target.checked)),
        [dispatch]
    );
    return (
        <Switch
            label="Filter by completions"
            size="small"
            onChange={handleSwitchChange}
            checked={hideZeroCompletions}
        />
    );
});

HideZeroCompletionsSwitch.displayName = "HideZeroCompletionsSwitch";
export default HideZeroCompletionsSwitch;
