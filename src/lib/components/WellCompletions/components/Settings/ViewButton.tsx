import { Button, Icon, Tooltip } from "@equinor/eds-core-react";
import { view_column } from "@equinor/eds-icons";
import {
    Box,
    createStyles,
    makeStyles,
    Menu,
    // eslint-disable-next-line prettier/prettier
    Theme
} from "@material-ui/core";
import React from "react";
import SortButton from "./SortButton";
import TimeAggregationSelector from "./TimeAggregationSelector";
import WellsPerPageSelector from "./WellsPerPageSelector";

Icon.add({ view_column }); // (this needs only be done once)
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            alignSelf: "center",
            width: "200px",
        },
    })
);
/**
 * A menu button that shows a list of viewing options
 */
const ViewButton: React.FC = React.memo(() => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    // Handlers
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    // Render
    return (
        <div>
            <Tooltip title="View">
                <Button variant="ghost_icon" onClick={handleClick}>
                    <Icon color="currentColor" name="view_column" />
                </Button>
            </Tooltip>
            <Menu
                id="view-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                classes={{ paper: classes.paper }}
            >
                <Box marginY={1}>
                    <SortButton />
                    <TimeAggregationSelector />
                    <WellsPerPageSelector />
                </Box>
            </Menu>
        </div>
    );
});

ViewButton.displayName = "ViewMenu";
export default ViewButton;
