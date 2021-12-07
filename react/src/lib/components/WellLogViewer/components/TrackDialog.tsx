import React, { Component, ReactNode } from "react";

import { TemplateTrack } from "./WellLogTemplateTypes";

import WellLogView from "./WellLogView";

// material ui
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@material-ui/core";

interface Props {
    templateTrack?: TemplateTrack; // input for editting
    onOK: (templateTrack: TemplateTrack) => void;
    wellLogView: WellLogView;
}
interface State extends TemplateTrack {
    open: boolean;
}

export class TrackPropertiesDialog extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = this.props.templateTrack
            ? {
                  ...this.props.templateTrack,

                  open: true,
              }
            : {
                  // we shold fill every posible state to allow this.setState() to set it
                  title: "New Track",

                  plots: [],
                  open: true,
              };

        this.closeDialog = this.closeDialog.bind(this);
        this.onOK = this.onOK.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onOK(): void {
        this.props.onOK(this.state);
        this.closeDialog();
    }

    onChange(e: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({ [e.target.id]: e.target.value } as unknown as State);
    }

    closeDialog(): void {
        this.setState({ open: false });
    }

    render(): ReactNode {
        const title = this.props.templateTrack ? "Edit track" : "Add New Track";
        return (
            <Dialog
                open={this.state.open}
                maxWidth="sm"
                fullWidth
                onClose={() => this.setState({ open: false })}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                    }}
                >
                    <TextField
                        id="title"
                        label="Title"
                        value={this.state.title}
                        onChange={this.onChange}
                    ></TextField>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="secondary"
                        variant="contained"
                        onClick={this.closeDialog}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={this.onOK}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
