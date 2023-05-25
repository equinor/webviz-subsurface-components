/* eslint-disable react/display-name */
import { Button, Dialog, Icon, Menu, Scrim } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import { sort } from "@equinor/eds-icons";
import React, { useState } from "react";
import SortTable from "./SortTable";

const PREFIX = "SortButton";

const classes = {
    action: `${PREFIX}-action`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")(() => ({
    [`& .${classes.action}`]: { margin: "5px" },
}));

// Use library approach
Icon.add({ sort }); // (this needs only be done once)
/**
 * A menu button that shows a dialog for sorting wells by attributes
 */
const SortButton: React.FC = React.memo(() => {
    // Dialogs
    const [visibleScrim, setVisibleScrim] = useState(false);
    const handleClose = () => {
        setVisibleScrim(!visibleScrim);
    };
    return (
        <Root>
            <Menu.Item onClick={() => setVisibleScrim(true)}>
                Sort/Group by Attributes
            </Menu.Item>
            {visibleScrim && (
                <Scrim onClose={handleClose}>
                    <Dialog style={{ minWidth: "400px" }}>
                        <Dialog.Title>Well sorting levels</Dialog.Title>
                        <Dialog.CustomContent>
                            <SortTable />
                        </Dialog.CustomContent>
                        <Dialog.Actions>
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
        </Root>
    );
});

SortButton.displayName = "SortButton";
export default SortButton;
