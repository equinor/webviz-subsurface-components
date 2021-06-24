import { Button, Icon, Tooltip } from "@equinor/eds-core-react";
import { filter_alt } from "@equinor/eds-icons";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateIsDrawerOpen } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";

// Use library approach
Icon.add({ filter_alt }); // (this needs only be done once)

/**
 * A button for toggle on and off the filter functions in the side drawer
 */
const FilterButton: React.FC = React.memo(() => {
    //Redux
    const dispatch = useDispatch();
    const isDrawerOpen = useSelector(
        (state: WellCompletionsState) => state.ui.isDrawerOpen
    );

    // Handlers
    const onClick = useCallback(
        () => dispatch(updateIsDrawerOpen(!isDrawerOpen)),
        [dispatch, isDrawerOpen]
    );

    //Render
    return (
        <div>
            <Tooltip title={isDrawerOpen ? "Close filter menu" : "Filter"}>
                <Button
                    //This is an attribute for testing purpose only.
                    //It can be removed using https://www.npmjs.com/package/babel-plugin-react-remove-properties.
                    data-testid="filter_button"
                    // Indicate the drawer is open by having the outlined border
                    variant={isDrawerOpen ? "outlined" : "ghost_icon"}
                    onClick={onClick}
                >
                    <Icon color="currentColor" name="filter_alt" />
                </Button>
            </Tooltip>
        </div>
    );
});

FilterButton.displayName = "FilterMenu";
export default FilterButton;
