import { Button, Icon, Tooltip, Menu, Dialog } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import { view_column } from "@equinor/eds-icons";
import React from "react";
import TimeAggregationSelector from "./TimeAggregationSelector";
import WellsPerPageSelector from "./WellsPerPageSelector";
import SortTable from "./SortTable";

const PREFIX = "ViewButton";

const classes = {
    paper: `${PREFIX}-paper`,
    action: `${PREFIX}-action`,
};

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.paper}`]: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        alignSelf: "center",
        width: "200px",
    },
}));

Icon.add({ view_column }); // (this needs only be done once)
/**
 * A menu button that shows a list of viewing options
 */
const ViewButton: React.FC = React.memo(() => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [dialogOpen, setDialogOpen] = React.useState<boolean>(false);

    // Handlers
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleCloseDialog = () => {
        setDialogOpen(!dialogOpen);
    };

    // Render
    return (
        <>
            <Root>
                <Tooltip title="View">
                    <Button variant="ghost_icon" onClick={handleClick}>
                        <Icon color="currentColor" name="view_column" />
                    </Button>
                </Tooltip>
                <Menu
                    id="view-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <Menu.Item onClick={() => setDialogOpen(true)}>
                        Sort/Group by Attributes
                    </Menu.Item>
                    <TimeAggregationSelector />
                    <WellsPerPageSelector />
                </Menu>
            </Root>
            {dialogOpen && (
                <Dialog
                    open={dialogOpen}
                    style={{ minWidth: "400px" }}
                    isDismissable
                    onClose={handleCloseDialog}
                >
                    <Dialog.Header>
                        <Dialog.Title>Well sorting levels</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.CustomContent>
                        <SortTable />
                    </Dialog.CustomContent>
                    <Dialog.Actions>
                        <Button
                            className={classes.action}
                            onClick={() => setDialogOpen(false)}
                        >
                            OK
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            )}
        </>
    );
});

ViewButton.displayName = "ViewMenu";
export default ViewButton;
