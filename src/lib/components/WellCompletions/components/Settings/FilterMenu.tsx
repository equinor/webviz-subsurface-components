import { Button, Icon, Tooltip } from "@equinor/eds-core-react";
import { filter_alt } from "@equinor/eds-icons";
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateIsDrawerOpen } from "../../redux/actions";

// Use library approach
Icon.add({ filter_alt }); // (this needs only be done once)

const FilterMenu: React.FC = React.memo(() => {
    const dispatch = useDispatch();

    const openDrawer = useCallback(() => dispatch(updateIsDrawerOpen(true)), [
        dispatch,
    ]);
    return (
        <div>
            <Tooltip title="Filter">
                <Button variant="ghost_icon" onClick={openDrawer}>
                    <Icon color="currentColor" name="filter_alt" />
                </Button>
            </Tooltip>
        </div>
    );
});

FilterMenu.displayName = "FilterMenu";
export default FilterMenu;
