import React from "react";

import { Button } from "@equinor/eds-core-react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";

interface SaveDialogProps {
    open: boolean;
    onSave: () => void;
    onClose: () => void;
}

export const SaveDialog: React.FC<SaveDialogProps> = (
    props: SaveDialogProps
) => {
    const { open } = props;
    const [isOpen, setIsOpen] = React.useState<boolean>(open || false);

    React.useEffect(() => {
        setIsOpen(open || false);
    }, [open]);

    const handleClose = React.useCallback(() => {
        props.onClose();
        setIsOpen(false);
    }, [props.onClose, setIsOpen]);

    const handleSaveClick = React.useCallback(() => {
        props.onSave();
        setIsOpen(false);
    }, [props.onSave]);

    return (
        <Dialog
            open={isOpen}
            onClose={() => handleClose()}
            aria-describedby="save-dialog-description"
        >
            <DialogContent>
                <DialogContentText id="save-dialog-description">
                    Do you want to save changes?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose()} variant="outlined">
                    No
                </Button>
                <Button onClick={() => handleSaveClick()}>Yes</Button>
            </DialogActions>
        </Dialog>
    );
};
