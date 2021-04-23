/* eslint-disable react/display-name */
import { Button, Dialog, Icon, Menu, Scrim } from "@equinor/eds-core-react";
import { sort } from "@equinor/eds-icons";
import { createStyles, makeStyles } from "@material-ui/core";
import React, { useState } from "react";
import SortTable from "./SortTable";

// Use library approach
Icon.add({ sort }); // (this needs only be done once)
const useStyles = makeStyles(() =>
    createStyles({
        dialog: {
            minWidth: "400px",
        },
        action: { margin: "5px" },
    })
);

const SortButton: React.FC = React.memo(() => {
    const classes = useStyles();
    // Dialogs

    const [visibleScrim, setVisibleScrim] = useState(false);
    const handleClose = () => {
        setVisibleScrim(!visibleScrim);
    };
    return (
        <>
            <Menu.MenuItem onClick={() => setVisibleScrim(true)}>
                Sort/Group by Attributes
            </Menu.MenuItem>
            {visibleScrim && (
                <Scrim onClose={handleClose}>
                    <Dialog className={classes.dialog}>
                        <Dialog.Title>Well sorting levels</Dialog.Title>
                        <Dialog.CustomContent>
                            <SortTable />
                        </Dialog.CustomContent>
                        <Dialog.Actions>
                            <Button
                                className={classes.action}
                                variant="ghost"
                                onClick={() => setVisibleScrim(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className={classes.action}
                                onClick={() => setVisibleScrim(false)}
                            >
                                OK
                            </Button>
                        </Dialog.Actions>
                    </Dialog>
                </Scrim>
            )}
        </>
    );
});

SortButton.displayName = "SortButton";
export default SortButton;
