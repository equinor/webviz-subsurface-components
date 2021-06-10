/* eslint-disable react/display-name */
import { Button, Dialog, Icon, Menu, Scrim } from "@equinor/eds-core-react";
import { sort } from "@equinor/eds-icons";
import { createStyles, makeStyles } from "@material-ui/core";
import React, { useState } from "react";
import WellAttributesSelector from "./WellAttributesSelector";

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

const FilterByAttributesButton: React.FC = React.memo(() => {
    const classes = useStyles();
    // Dialogs

    const [visibleScrim, setVisibleScrim] = useState(false);
    const handleClose = () => {
        setVisibleScrim(!visibleScrim);
    };
    return (
        <>
            <Menu.Item onClick={() => setVisibleScrim(true)}>
                Filter by Attributes
            </Menu.Item>
            {visibleScrim && (
                <Scrim onClose={handleClose}>
                    <Dialog className={classes.dialog}>
                        <Dialog.CustomContent>
                            <WellAttributesSelector />
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

FilterByAttributesButton.displayName = "FilterByAttributesButton";
export default FilterByAttributesButton;
