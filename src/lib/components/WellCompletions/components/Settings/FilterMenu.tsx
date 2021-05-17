import { Button, Icon, Tooltip } from "@equinor/eds-core-react";
import { filter_alt } from "@equinor/eds-icons";
import { Drawer } from "@material-ui/core";
import React, { useCallback } from "react";
import HideZeroCompletionsSwitch from "./HideZeroCompletionsSwitch";
import WellAttributesSelector from "./WellAttributesSelector";
import WellFilter from "./WellFilter";
import ZoneSelector from "./ZoneSelector";

// Use library approach
Icon.add({ filter_alt }); // (this needs only be done once)
const FilterMenu: React.FC = React.memo(() => {
    const [open, setOpen] = React.useState<boolean>(false);
    const toggleDrawer = useCallback((open: boolean) => () => setOpen(open), [
        setOpen,
    ]);

    return (
        <div>
            <Tooltip title="Filter">
                <Button variant="ghost_icon" onClick={toggleDrawer(true)}>
                    <Icon color="currentColor" name="filter_alt" />
                </Button>
            </Tooltip>
            <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                <ZoneSelector />
                <WellFilter />
                <HideZeroCompletionsSwitch />
                <WellAttributesSelector />
            </Drawer>
        </div>
    );
});

FilterMenu.displayName = "FilterMenu";
export default FilterMenu;
