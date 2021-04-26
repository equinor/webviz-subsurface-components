import { Button, Icon, Tooltip } from "@equinor/eds-core-react";
import { filter_alt } from "@equinor/eds-icons";
import {
    Box,
    createStyles,
    makeStyles,
    Menu,
    // eslint-disable-next-line prettier/prettier
    Theme
} from "@material-ui/core";
import React, { useCallback } from "react";
import FilterByAttributesButton from "./FilterByAttributesButton";
import HideZeroCompletionsSwitch from "./HideZeroCompletionsSwitch";
import WellFilter from "./WellFilter";
import ZoneSelector from "./ZoneSelector";

// Use library approach
Icon.add({ filter_alt }); // (this needs only be done once)
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            alignSelf: "center",
            width: "250px",
        },
    })
);
const FilterMenu: React.FC = React.memo(() => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    // handlers
    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) =>
            setAnchorEl(event.currentTarget),
        []
    );

    const handleClose = useCallback(() => setAnchorEl(null), []);

    return (
        <div>
            <Tooltip title="Filter">
                <Button variant="ghost_icon" onClick={handleClick}>
                    <Icon color="currentColor" name="filter_alt" />
                </Button>
            </Tooltip>
            <Menu
                id="filter-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                classes={{ paper: classes.paper }}
            >
                <Box marginY={1}>
                    <HideZeroCompletionsSwitch />
                    <ZoneSelector />
                    <WellFilter />
                    <FilterByAttributesButton />
                </Box>
            </Menu>
        </div>
    );
});

FilterMenu.displayName = "FilterMenu";
export default FilterMenu;
