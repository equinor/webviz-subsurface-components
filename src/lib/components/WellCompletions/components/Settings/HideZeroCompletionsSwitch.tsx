import { Switch } from "@equinor/eds-core-react";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateHideZeroCompletions } from "../../redux/reducer";
import { WellCompletionsState } from "../../redux/store";

const HideZeroCompletionsSwitch: React.FC = React.memo(() => {
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
