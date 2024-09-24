import type { ReactNode } from "react";
import React, { Component } from "react";

import type { Track, GraphTrack } from "@equinor/videx-wellog";

import type { TemplatePlot, TemplatePlotTypes } from "./WellLogTemplateTypes";
import type { WellLog } from "./WellLogTypes";
import type { ColorFunction } from "./ColorTableTypes";

import type WellLogView from "./WellLogView";

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
} from "@mui/material";
import { getTrackTemplate } from "../utils/tracks";

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
    darkred: "Dark red",
    lightgreen: "Light green",
    lightblue: "Light blue",
    yellow: "Yellow",
    white: "White",
};

const booleanItems: Record<string, string> = {
    // language dependent names of plot types
    false: "No",
    true: "Yes",
};

const noneValue = "-";

export function _createItems(items: Record<string, string>): ReactNode[] {
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
export function createScaleItems(): ReactNode[] {
    return _createItems(scaleItems);
}
function createColorItems(): ReactNode[] {
    return _createItems(colorItems);
}

export function createBooleanItems(): ReactNode[] {
    return _createItems(booleanItems);
}

function createColorFunctionItems(
    colorFunctions: ColorFunction[]
): ReactNode[] {
    const nodes: ReactNode[] = [];
    if (!colorFunctions || !colorFunctions.length) {
        console.error(
            "colorFunctions are missed or empty in createColorFunctionItems()"
        );
    } else {
        for (const colorFunction of colorFunctions) {
            const name = colorFunction.name;
            if (!name) {
                console.error(
                    "colorFunction.name is empty in createColorFunctionItems()"
                );
            }
            nodes.push(<option key={name}>{name}</option>);
        }
    }
    return nodes;
}

function createDataItem(item: string): ReactNode {
    return (
        <option key={item} value={item}>
            {item}
        </option>
    );
}

export function dataNames(
    welllog: WellLog | undefined,
    track: Track | null,
    discrete?: boolean
): string[] {
    const names: string[] = [];
    if (welllog) {
        const skipUsed = !!track;
        const plots = track ? (track as GraphTrack).plots : undefined;
        const abbr = track ? track.options.abbr : undefined;

        const curves = welllog.curves;
        let iCurve = 0;
        for (const curve of curves) {
            if (
                discrete &&
                curve.valueType !== "string" &&
                curve.valueType !== "integer"
            )
                continue;

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

export function createDataItems(
    welllog: WellLog | undefined,
    track: Track | null,
    discrete?: boolean
): ReactNode[] {
    const names = dataNames(welllog, track, discrete);
    return names.map((name) => createDataItem(name));
}

export const dialogContentStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    paddingTop: 20,
    gap: 10,
};

interface Props {
    templatePlot?: TemplatePlot; // input for editting
    onOK: (templatePlot: TemplatePlot) => void;
    wellLogView: WellLogView;
    track: Track;
}
interface State extends TemplatePlot {
    open: boolean;
}

function templatePlotPlus(templatePlot: TemplatePlot) {
    return {
        colorFunction: templatePlot.colorFunction,
        inverseColorFunction: templatePlot.inverseColorFunction,
    };
}

export class PlotPropertiesDialog extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        let name = "",
            name2 = "";
        const names = this.dataNames(true);
        if (names[0]) name2 = name = names[0];
        if (names[1]) name2 = names[1];

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const trackTemplate = getTrackTemplate(this.props.track);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const templatePlot = this.props.templatePlot;
        this.state = templatePlot
            ? {
                  ...templatePlot,
                  ...templatePlotPlus(templatePlot),

                  open: true,
              }
            : {
                  // we should fill every posible state to allow this.setState() to set it
                  type: trackTemplate.scale ? "" : "line",
                  name: name, //?? the first data in data selector
                  name2: name2, //? the second data in data selector ??

                  scale: undefined,
                  color: "black", //??

                  // for 'area' plot
                  fill: "red",
                  fillOpacity: 0.25,
                  inverseColor: "",

                  // for 'gradientfill' plot
                  colorFunction:
                      // TODO: Fix this the next time the file is edited.
                      // eslint-disable-next-line react/prop-types
                      this.props.wellLogView.props.colorFunctions?.[0]?.name,
                  inverseColorFunction: undefined,
                  colorScale: undefined,
                  inverseColorScale: undefined,

                  // for 'differential' plot
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
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line react/prop-types
                    const skipUsed = this.props.templatePlot
                        ? false
                        : true; /*??*/
                    this.setState({ name2: this.dataNames(skipUsed)[0] });
                }
            }
        }
    }

    onOK(): void {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.props.onOK(this.state);
        this.closeDialog();
    }

    closeDialog(): void {
        this.setState({ open: false });
    }

    dataNames(skipUsed: boolean): string[] {
        return dataNames(
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.wellLogView.props.welllog,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            skipUsed ? this.props.track : null
        );
    }

    createDataItems(skipUsed: boolean): ReactNode[] {
        const names = this.dataNames(skipUsed);
        return names.map((name) => createDataItem(name));
    }

    createSelectControl(
        valueName: string, // use it as "a pointer to member" of an object
        label: string,
        nodes: ReactNode[],
        insertEmpty?: string | boolean
    ): ReactNode {
        let value = (this.state as unknown as Record<string, string>)[
            valueName
        ];
        if (insertEmpty) {
            if (!value) value = noneValue;
            // insert at the beginning
            nodes.unshift(
                <option key={noneValue} value={noneValue}>
                    {insertEmpty == true ? "\u2014" : insertEmpty}
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

    createSelectControlFromType(type?: TemplatePlotTypes): ReactNode {
        if (type === "area" || type === "differential") {
            return [
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
                    <FormControl fullWidth key="114" />
                ),
            ];
        } else if (type === "gradientfill") {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            const colorFunctions = this.props.wellLogView.props.colorFunctions;
            return [
                this.createSelectControl(
                    "colorFunction",
                    "Fill Color table",
                    createColorFunctionItems(colorFunctions)
                ),
                <FormControl fullWidth key="211" />,
                <FormControl fullWidth key="212" />,
                this.createSelectControl(
                    "inverseColorFunction",
                    "Inverse Color table",
                    createColorFunctionItems(colorFunctions),
                    true
                ),
            ];
        }

        return [];
    }

    render(): JSX.Element {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const trackTemplate = getTrackTemplate(this.props.track);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const title = this.props.templatePlot ? "Edit plot" : "Add New Plot";
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const skipUsed = this.props.templatePlot ? false : true; /*??*/
        const scale = this.state.scale || trackTemplate.scale;
        return (
            <Dialog
                open={this.state.open}
                maxWidth="sm"
                fullWidth
                onClose={() => this.setState({ open: false })}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent style={dialogContentStyle}>
                    {this.createSelectControl(
                        "type",
                        "Type",
                        createTypeItems()
                    )}
                    {this.createSelectControl(
                        "scale",
                        "Scale",
                        createScaleItems(),
                        "Track scale"
                    )}
                    {this.state.type === "gradientfill" && scale === "linear"
                        ? [
                              this.createSelectControl(
                                  "colorScale",
                                  "Color Scale",
                                  createScaleItems()
                              ),
                          ]
                        : [<FormControl fullWidth key="12" />]}

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
                    {this.createSelectControlFromType(this.state.type)}
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
