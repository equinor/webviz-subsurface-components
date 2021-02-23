/* eslint-disable react/display-name */
import { Icon, Tooltip } from "@equinor/eds-core-react";
import { sort } from "@equinor/eds-icons";
import {
    Button,
    createStyles,
    makeStyles,
    Menu,

    // eslint-disable-next-line prettier/prettier
    Theme
} from "@material-ui/core";
import React, { useCallback } from "react";
import { useDialog } from "../Utils/useDialog";
import SortTable from "./SortTable";

// Use library approach
Icon.add({ sort }); // (this needs only be done once)
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
const SortMenu: React.FC = React.memo(() => {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    // handlers
    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) =>
            setAnchorEl(event.currentTarget),
        []
    );

    const handleClose = useCallback(() => setAnchorEl(null), []);

    // Dialogs
    const {
        launchDialog: launchSortDialog,
        renderDialog: renderSortDialog,
    } = useDialog({
        dialogComponent: () => <SortTable />,
    });
    return (
        <div>
            <Tooltip title="Sort">
                <Button
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={launchSortDialog}
                >
                    <Icon color="currentColor" name="sort" />
                </Button>
            </Tooltip>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                classes={{ paper: classes.paper }}
            ></Menu>
            {renderSortDialog()}
        </div>
    );
});

SortMenu.displayName = "SortMenu";
export default SortMenu;
