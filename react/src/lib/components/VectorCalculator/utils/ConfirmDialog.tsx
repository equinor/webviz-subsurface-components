import React from "react";

import { Button } from "@equinor/eds-core-react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";

interface ConfirmDialogProps {
    id: string;
    open: boolean;
    text: string;
    containerRef: React.RefObject<HTMLDivElement | null>;
    onYes: () => void;
    onNo: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = (
    props: ConfirmDialogProps
) => {
    const [isOpen, setIsOpen] = React.useState<boolean>(props.open || false);

    React.useEffect(() => {
        setIsOpen(props.open || false);
    }, [props.open]);

    const handleNoClick = React.useCallback(() => {
        props.onNo();
        setIsOpen(false);
    }, [props.onNo, setIsOpen]);

    const handleYesClick = React.useCallback(() => {
        props.onYes();
        setIsOpen(false);
    }, [props.onYes, setIsOpen]);

    return (
        <Dialog
            open={isOpen}
            id={props.id}
            aria-describedby={`${props.id}-description`}
            container={props.containerRef.current}
        >
            <DialogContent>
                <DialogContentText id={`${props.id}-content-text`}>
                    {props.text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleNoClick()} variant="outlined">
                    No
                </Button>
                <Button onClick={() => handleYesClick()}>Yes</Button>
            </DialogActions>
        </Dialog>
    );
};
