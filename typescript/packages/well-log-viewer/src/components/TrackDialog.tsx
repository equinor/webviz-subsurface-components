import type { ReactNode } from "react";
import React, { Component } from "react";

import type { TemplateTrack, TemplatePlot } from "./WellLogTemplateTypes";

import type WellLogView from "./WellLogView";

// material ui
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";

import { FormControl, InputLabel, NativeSelect } from "@mui/material";

import { createDataItems, dataNames } from "./PlotDialog";
import { createScaleItems } from "./PlotDialog";
import { createBooleanItems } from "./PlotDialog";
import { _createItems } from "./PlotDialog";
import { dialogContentStyle } from "./PlotDialog";

const noneValue = "-";

interface Props {
    templateTrack?: TemplateTrack; // input for editting
    onOK: (templateTrack: TemplateTrack) => void;
    wellLogView: WellLogView;
}
interface State extends TemplateTrack {
    stacked: string;
    stackedName: string; // data name
    showLabels: string;
    showLines: string;
    labelRotation: number;

    open: boolean;
}

export class TrackPropertiesDialog extends Component<Props, State> {
    bStacked: boolean | undefined;
    constructor(props: Props) {
        super(props);
        let name = "";
        const names = dataNames(
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.wellLogView.props.welllog,
            null,
            true
        );
        if (names[0]) name = names[0];

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const templateTrack = this.props.templateTrack;
        this.bStacked =
            templateTrack &&
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            templateTrack.plots &&
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            templateTrack.plots[0] &&
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            templateTrack.plots[0].type === "stacked";
        this.state = templateTrack
            ? {
                  ...templateTrack,

                  stacked: this.bStacked ? "1" : "0",
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line react/prop-types
                  stackedName: templateTrack.plots[0]?.name,
                  showLabels:
                      // TODO: Fix this the next time the file is edited.
                      // eslint-disable-next-line react/prop-types
                      templateTrack.plots[0]?.showLabels !== false ? "true" : "false",
                  showLines:
                      // TODO: Fix this the next time the file is edited.
                      // eslint-disable-next-line react/prop-types
                      templateTrack.plots[0]?.showLines !== false ? "true" : "false",
                  // TODO: Fix this the next time the file is edited.
                  // eslint-disable-next-line react/prop-types
                  labelRotation: templateTrack.plots[0]?.labelRotation || 0,
                  open: true,
              }
            : {
                  // we should fill every posible state to allow this.setState() to set it
                  title: "New Track",
                  scale: undefined,
                  domain: undefined,

                  plots: [],

                  stacked: "0",
                  stackedName: name,
                  showLabels: "true",
                  showLines: "true",
                  labelRotation: 0,
                  open: true,
              };

        this.closeDialog = this.closeDialog.bind(this);
        this.onOK = this.onOK.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onChangeChecked = this.onChangeChecked.bind(this);
    }

    onOK(): void {
        if (parseInt(this.state.stacked)) {
            const plot0: TemplatePlot = this.state.plots[0];
            this.state.plots.splice(0, this.state.plots.length); // clear array
            const plot: TemplatePlot = {
                ...plot0,
                type: "stacked",
                name: this.state.stackedName,
                showLabels: this.state.showLabels === "true",
                showLines: this.state.showLines === "true",
                labelRotation: this.state.labelRotation || 0,
                //color: "not used", // not used in stacked
            };
            this.state.plots.push(plot);
        }
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.props.onOK(this.state);
        this.closeDialog();
    }

    onChange(e: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({ [e.target.id]: e.target.value } as unknown as State);
    }
    onChangeChecked(e: React.ChangeEvent<HTMLInputElement>): void {
        this.setState({ [e.target.id]: e.target.checked } as unknown as State);
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
            <FormControl fullWidth key={valueName}>
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

    render(): JSX.Element {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const templateTrack = this.props.templateTrack;
        const title = templateTrack ? "Edit track" : "Add New Track";
        return (
            <Dialog
                open={this.state.open}
                maxWidth="sm"
                fullWidth
                onClose={() => this.setState({ open: false })}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent style={dialogContentStyle}>
                    <TextField
                        id="title"
                        label="Title"
                        value={this.state.title}
                        onChange={this.onChange}
                    ></TextField>

                    {templateTrack ? (
                        <></>
                    ) : (
                        this.createSelectControl(
                            "stacked",
                            "Type",
                            _createItems({ "0": "Graph", "1": "Stacked" }),
                            false
                        )
                    )}

                    {parseInt(this.state.stacked)
                        ? [
                              this.createSelectControl(
                                  "stackedName", // data
                                  "Data",
                                  createDataItems(
                                      // TODO: Fix this the next time the file is edited.
                                      // eslint-disable-next-line react/prop-types
                                      this.props.wellLogView.props.welllog,
                                      null,
                                      true
                                  )
                              ),
                              this.createSelectControl(
                                  "showLines",
                                  "Lines",
                                  createBooleanItems()
                              ),
                              this.createSelectControl(
                                  "showLabels",
                                  "Labels",
                                  createBooleanItems()
                              ),
                              <TextField
                                  type="number"
                                  id="labelRotation"
                                  label="Labels Rotation"
                                  key="labelRotation"
                                  value={this.state.labelRotation}
                                  onChange={(e) => {
                                      this.setState({
                                          [e.target.id]: Number(e.target.value),
                                      } as unknown as State);
                                  }}
                                  InputProps={{
                                      inputProps: {
                                          min: -180,
                                          max: 180,
                                          step: 10,
                                      },
                                  }}
                              />,
                          ]
                        : [
                              this.createSelectControl(
                                  "scale",
                                  "Scale",
                                  createScaleItems(),
                                  true
                              ),
                          ]}
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
