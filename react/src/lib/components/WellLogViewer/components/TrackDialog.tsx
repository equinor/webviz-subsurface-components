import React, { Component, ReactNode } from "react";

import { TemplateTrack } from "./WellLogTemplateTypes";

import { Track, GraphTrack } from "@equinor/videx-wellog";

import WellLogView from "./WellLogView";

// material ui
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    TextField,
} from "@material-ui/core";

interface TrackPropertiesDialogProps {
    templateTrack?: TemplateTrack; // input for editting
    onOK: (templateTrack: TemplateTrack) => void;
    wellLogView: WellLogView;
    track: Track;
}
interface TrackPropertiesDialogState extends TemplateTrack {
    open: boolean;
}

export class TrackPropertiesDialog extends Component<
    TrackPropertiesDialogProps,
    TrackPropertiesDialogState
> {
    constructor(props: TrackPropertiesDialogProps) {
        super(props);

        this.state = this.props.templateTrack
            ? {
                  ...this.props.templateTrack,

                  open: true,
              }
            : {
                  // we shold fill every posible state to allow this.setState() to set it
                  title: "",

                  plots: [],
                  open: true,
              };

        this.closeDialog = this.closeDialog.bind(this);
        this.onOK = this.onOK.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onOK(): void {
        const templateTrack = { ...this.state };
        // set some values wich are not edited by the dialog
        this.props.onOK(templateTrack);
        this.closeDialog();
    }

    onChange(e): void {
        this.setState({ [e.target.id]: e.target.value })
    }

    closeDialog(): void {
        this.setState({ open: false });
    }

    render(): ReactNode {
        const title = this.props.templateTrack ? "Edit track" : "Add New Track";
        return (
            <Dialog open={this.state.open} maxWidth="sm" fullWidth onClose={() => this.setState({open:false})}>
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
