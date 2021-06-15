import { Button, Icon, Tooltip } from "@equinor/eds-core-react";
import { filter_alt } from "@equinor/eds-icons";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateIsDrawerOpen } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";

// Use library approach
Icon.add({ filter_alt }); // (this needs only be done once)

const FilterMenu: React.FC = React.memo(() => {
    const dispatch = useDispatch();

    const isDrawerOpen = useSelector(
        (state: WellCompletionsState) => state.ui.isDrawerOpen
    );
    const openDrawer = useCallback(
        () => dispatch(updateIsDrawerOpen(!isDrawerOpen)),
        [dispatch, isDrawerOpen]
    );
    return (
        <div>
            <Tooltip title={isDrawerOpen ? "Close filter menu" : "Filter"}>
                <Button
                    data-testid="filter_button"
                    variant={isDrawerOpen ? "outlined" : "ghost_icon"}
                    onClick={openDrawer}
                >
                    <Icon color="currentColor" name="filter_alt" />
                </Button>
            </Tooltip>
        </div>
    );
});

FilterMenu.displayName = "FilterMenu";
export default FilterMenu;
