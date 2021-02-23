/* eslint-disable @typescript-eslint/no-empty-function */
import { Dialog } from "@material-ui/core";
import React, { useCallback, useMemo, useState } from "react";

interface HookProps {
    /** The component to be rendered inside the dialog  */
    dialogComponent: () => JSX.Element;
    /** The method to be called when the dialog launches */
    onLaunch?: () => void;
    /** The method to be called when the dialog closes */
    onClose?: () => void;
    /** whether the component is kept mouted when hidden. true by default  */
    keepMounted?: boolean;
    /** maxWidth. "lg" by default  */
    maxWidth?: false | "xs" | "sm" | "md" | "lg" | "xl";
}

interface HookReturnType {
    /**
     * The method to be called by other components (usually in OnClick prop)
     * to launch the dialog
     */
    launchDialog: () => void;
    /**
     * The method to be called by other components to close the dialog
     * if open
     */
    closeDialog: () => void;
    /**
     * The callback to be used to render the dialog.
     * Note this callbback should always be placed in the returned JSX element
     * of the component that will trigger the dialog
     */
    renderDialog: () => JSX.Element;
}

/**
 * A hook for displaying a dialog with the the provided renderer callback
 */
export const useDialog = ({
    dialogComponent,
    onLaunch = () => {},
    onClose = () => {},
    keepMounted = true,
    maxWidth = "lg",
}: HookProps): HookReturnType => {
    // State
    const [open, setOpen] = useState(false);

    // Handlers
    const launchDialog = useCallback(() => {
        setOpen(true);
        onLaunch();
    }, [onLaunch]);

    const closeDialog = useCallback(() => {
        setOpen(false);
        onClose();
    }, [onClose]);

    const onBackdropClick = useCallback(() => {
        setOpen(false);
    }, []);

    const renderDialog = useCallback(() => {
        return (
            <Dialog
                open={open}
                keepMounted={keepMounted}
                onClose={closeDialog}
                onBackdropClick={onBackdropClick}
                maxWidth={maxWidth}
            >
                {dialogComponent()}
            </Dialog>
        );
    }, [
        open,
        keepMounted,
        closeDialog,
        onBackdropClick,
        maxWidth,
        dialogComponent,
    ]);

    return useMemo(
        () => ({
            launchDialog,
            closeDialog,
            renderDialog,
        }),
        [closeDialog, launchDialog, renderDialog]
    );
};
