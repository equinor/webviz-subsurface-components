import React, { Component, ReactNode } from "react";

import { TemplatePlot } from "./WellLogTemplateTypes";

import { Track, GraphTrack } from "@equinor/videx-wellog";

import WellLogView from "./WellLogView";
import { ColorTable } from "./ColorTableTypes";

// material ui
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    NativeSelect,
} from "@material-ui/core";

const typeItems: Record<string, string> = {
    // language dependent names of plot types
    line: "Line",
    linestep: "Line Step",
    dot: "Dot",
    area: "Area",
    gradientfill: "Gradient Fill",
    differential: "Differential",
};

const scaleItems: Record<string, string> = {
    // language dependent names of plot types
    linear: "Linear",
    log: "Logarithmic",
};

const colorItems: Record<string, string> = {
    // language dependent names of colors
    black: "Black",
    red: "Red",
    green: "Green",
    blue: "Blue",
    brown: "Brown",
    magenta: "Magenta",
    orange: "Orange",
    gray: "Gray",
    lightred: "Light red",
    lightgreen: "Light green",
    lightblue: "Light blue",
    yellow: "Yellow",
    white: "White",
};

const noneValue = "-";

function _createItems(items: Record<string, string>): ReactNode[] {
    const nodes: ReactNode[] = [];
    for (const key in items) {
        nodes.push(
            <option key={key} value={key}>
                {items[key]}
            </option>
        );
    }
    return nodes;
}

function createTypeItems(): ReactNode[] {
    return _createItems(typeItems);
}
function createScaleItems(): ReactNode[] {
    return _createItems(scaleItems);
}
function createColorItems(): ReactNode[] {
    return _createItems(colorItems);
}

function createColorTableItems(colorTables: ColorTable[]): ReactNode[] {
    const nodes: ReactNode[] = [];
    for (const colorTable of colorTables) {
        if (colorTable.discrete)
            // skip discrete color tables
            continue;
        nodes.push(<option key={colorTable.name}>{colorTable.name}</option>);
    }
    return nodes;
}

interface Props {
    templatePlot?: TemplatePlot; // input for editting
    onOK: (templatePlot: TemplatePlot) => void;
    wellLogView: WellLogView;
    track: Track;
}
interface State extends TemplatePlot {
    open: boolean;
}

export class PlotPropertiesDialog extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        let name = "",
            name2 = "";
        const names = this.dataNames(true);
        if (names[0]) name2 = name = names[0];
        if (names[1]) name2 = names[1];

        this.state = this.props.templatePlot
            ? {
                  ...this.props.templatePlot,

                  open: true,
              }
            : {
                  // we should fill every posible state to allow this.setState() to set it
                  type: "line",
                  name: name, //?? the first data in data selector
                  name2: name2, //? the second data in data selector ??

                  color: "black", //??

                  // for 'area' plot
                  fill: "red",
                  fillOpacity: 0.25,
                  inverseColor: "",

                  // for 'gradient fill' plot
                  colorTable: this.props.wellLogView.props.colorTables[0].name,
                  inverseColorTable: "",

                  // for 'differetial' plot
                  color2: "black", //??
                  fill2: "green",

                  open: true,
              };

        this.closeDialog = this.closeDialog.bind(this);
        this.onOK = this.onOK.bind(this);
    }

    componentDidUpdate(_prevProps: Props, prevState: State): void {
        if (this.state.type !== prevState.type) {
            if (this.state.type === "area") {
                if (!this.state.fill) this.setState({ fill: "black" });
            } else if (this.state.type === "gradientfill") {
                if (this.state.inverseColor)
                    this.setState({ inverseColor: "" });
            } else if (this.state.type === "differential") {
                if (!this.state.name2) {
                    const skipUsed = this.props.templatePlot
                        ? false
                        : true; /*??*/
                    this.setState({ name2: this.dataNames(skipUsed)[0] });
                }
            }
        }
    }

    onOK(): void {
        this.props.onOK(this.state);
        this.closeDialog();
    }

    closeDialog(): void {
        this.setState({ open: false });
    }

    dataNames(skipUsed: boolean): string[] {
        const names: string[] = [];
        const welllog = this.props.wellLogView.props.welllog;
        if (welllog && welllog[0]) {
            const track = this.props.track;
            const plots = (track as GraphTrack).plots;
            const abbr = track.options.abbr;

            const curves = welllog[0].curves;
            let iCurve = 0;
            for (const curve of curves) {
                let bUsed = false;
                if (plots) {
                    // GraphTrack
                    for (const plot of plots)
                        if (plot.id == iCurve) {
                            bUsed = true;
                            break;
                        }
                } else if (abbr === curve.name) {
                    // Scale tracks?
                    bUsed = true;
                }
                if (!bUsed || !skipUsed) names.push(curve.name);
                iCurve++;
            }
        }
        return names;
    }

    createDataItem(item: string): ReactNode {
        return (
            <option key={item} value={item}>
                {item}
            </option>
        );
    }

    createDataItems(skipUsed: boolean): ReactNode[] {
        const names = this.dataNames(skipUsed);
        return names.map((name) => this.createDataItem(name));
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
            // insert at the beginning (reverse order? add to the edn, reverse back)
            nodes.reverse();
            nodes.push(
                <option key={noneValue} value={noneValue}>
                    {"\u2014"}
                </option>
            );
            nodes.reverse();
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
        const title = this.props.templatePlot ? "Edit plot" : "Add New Plot";
        const skipUsed = this.props.templatePlot ? false : true; /*??*/
        const colorTables = this.props.wellLogView.props.colorTables;
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
                    {this.createSelectControl(
                        "type",
                        "Type",
                        createTypeItems()
                    )}
                    {this.createSelectControl(
                        "scale",
                        "Scale",
                        createScaleItems()
                    )}
                    <FormControl fullWidth key="12" />

                    {this.createSelectControl(
                        "name",
                        "Data",
                        this.createDataItems(skipUsed)
                    )}
                    {this.createSelectControl(
                        "color",
                        this.state.type === "dot" ? "Dot Color" : "Line Color",
                        createColorItems()
                    )}

                    {this.state.type === "area" ||
                    this.state.type === "differential"
                        ? [
                              this.createSelectControl(
                                  "fill",
                                  "Fill Color",
                                  createColorItems()
                              ),
                              <FormControl fullWidth key="112" />,
                              <FormControl fullWidth key="113" />,
                              this.state.type === "area" ? (
                                  this.createSelectControl(
                                      "inverseColor",
                                      "Inverse Color",
                                      createColorItems(),
                                      true
                                  )
                              ) : (
                                  <FormControl fullWidth />
                              ),
                          ]
                        : this.state.type === "gradientfill"
                        ? [
                              this.createSelectControl(
                                  "colorTable",
                                  "Fill Color table",
                                  createColorTableItems(colorTables)
                              ),
                              <FormControl fullWidth key="211" />,
                              <FormControl fullWidth key="212" />,
                              this.createSelectControl(
                                  "inverseColorTable",
                                  "Inverse Color table",
                                  createColorTableItems(colorTables),
                                  true
                              ),
                          ]
                        : []}

                    {this.state.type === "differential"
                        ? [
                              this.createSelectControl(
                                  "name2",
                                  "Data 2",
                                  this.createDataItems(skipUsed)
                              ),
                              this.createSelectControl(
                                  "color2",
                                  "Line Color 2",
                                  createColorItems()
                              ),
                              this.createSelectControl(
                                  "fill2",
                                  "Fill Color 2",
                                  createColorItems()
                              ),
                          ]
                        : []}
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
