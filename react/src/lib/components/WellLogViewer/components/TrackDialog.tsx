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

import { FormControl, InputLabel, NativeSelect } from "@material-ui/core";

import { createScaleItems } from "./PlotDialog";
const noneValue = "-";

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

        const templateTrack = this.props.templateTrack;
        this.state = templateTrack
            ? {
                  ...templateTrack,

                  open: true,
              }
            : {
                  // we should fill every posible state to allow this.setState() to set it
                  title: "New Track",
                  scale: undefined,
                  domain: undefined,

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

    createSelectControl(
        valueName: string, // use it as "a pointer to member" of an object
        label: string,
        nodes: ReactNode[],
        insertEmpty?: boolean
    ): ReactNode {
        let value = (this.state as unknown as Record<string, string>)[
            valueName
        ];
        if (insertEmpty) {
            if (!value) value = noneValue;
            // insert at the beginning
            nodes.unshift(
                <option key={noneValue} value={noneValue}>
                    {"\u2014"}
                </option>
            );
        }
        return (
            <FormControl fullWidth>
                <InputLabel>{label}</InputLabel>
                <NativeSelect
                    value={value}
                    onChange={(event) => {
                        const value =
                            event.currentTarget.value === noneValue
                                ? ""
                                : event.currentTarget.value;

                        const values = new Object() as Record<string, string>;
                        values[valueName] = value;
                        this.setState(values as unknown as State);
                    }}
                >
                    {nodes}
                </NativeSelect>
            </FormControl>
        );
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

                    {this.createSelectControl(
                        "scale",
                        "Scale",
                        createScaleItems(),
                        true
                    )}
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
