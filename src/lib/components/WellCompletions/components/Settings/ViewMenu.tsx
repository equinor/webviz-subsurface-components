import { Icon } from "@equinor/eds-core-react";
// eslint-disable-next-line @typescript-eslint/camelcase
import { view_column } from "@equinor/eds-icons";
import {
    Box,
    Button,
    createStyles,
    makeStyles,
    Menu,
    // eslint-disable-next-line prettier/prettier
    Theme
} from "@material-ui/core";
import React from "react";
import RangeDisplayModeSelector from "./RangeDisplayModeSelector";
import WellsPerPageSelector from "./WellsPerPageSelector";

// Use library approach
// eslint-disable-next-line @typescript-eslint/camelcase
Icon.add({ view_column }); // (this needs only be done once)
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            alignSelf: "center",
            width: "150px",
        },
    })
);
const ViewMenu: React.FC = React.memo(() => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    // handlers
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Button
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}
            >
                <Icon color="currentColor" name="view_column" />
            </Button>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                classes={{ paper: classes.paper }}
            >
                <Box marginY={1}>
                    <RangeDisplayModeSelector />
                    <WellsPerPageSelector />
                </Box>
            </Menu>
        </div>
    );
});

ViewMenu.displayName = "ViewMenu";
export default ViewMenu;
