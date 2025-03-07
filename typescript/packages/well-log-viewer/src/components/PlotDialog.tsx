import type { ReactNode } from "react";
import React, { Component } from "react";

import type { Track, GraphTrack } from "@equinor/videx-wellog";

import type { WellLogSet } from "./WellLogTypes";
import type { TemplatePlot, TemplatePlotType } from "./WellLogTemplateTypes";
import type { ColorMapFunction } from "../utils/color-function";

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
    colorMapFunctions: ColorMapFunction[]
): ReactNode[] {
    const nodes: ReactNode[] = [];
    if (!colorMapFunctions || !colorMapFunctions.length) {
        console.error(
            "colorMapFunctions are missed or empty in createColorFunctionItems()"
        );
    } else {
        for (const colorMapFunction of colorMapFunctions) {
            const name = colorMapFunction.name;
            if (!name) {
                console.error(
                    "colorMapFunction.name is empty in createColorFunctionItems()"
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
    wellLogSets: WellLogSet[],
    track: Track | null,
    discrete?: boolean
): string[] {
    // The same curve might show multiple times across log sets, using a set to discard duplicates
    // ! This is only okay because we always just use the first instance of the curve anyways
    const names = new Set<string>();

    for (const logSet of wellLogSets) {
        const skipUsed = !!track;
        const plots = track ? (track as GraphTrack).plots : undefined;
        const abbr = track ? track.options.abbr : undefined;

        const curves = logSet.curves;
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
                    if (plot.id === iCurve) {
                        bUsed = true;
                        break;
                    }
            } else if (abbr === curve.name) {
                // Scale tracks?
                bUsed = true;
            }
            if (!bUsed || !skipUsed) names.add(curve.name);
            iCurve++;
        }
    }
    return Array.from(names);
}

export function createDataItems(
    wellLogSets: WellLogSet[],
    track: Track | null,
    discrete?: boolean
): ReactNode[] {
    const names = dataNames(wellLogSets, track, discrete);
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

export class PlotPropertiesDialog extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        let name = "",
            name2 = "";
        const names = this.dataNames(true);
        if (names[0]) name2 = name = names[0];
        if (names[1]) name2 = names[1];

        const trackTemplate = getTrackTemplate(this.props.track);
        const templatePlot = this.props.templatePlot;
        this.state = templatePlot
            ? {
                  ...templatePlot,
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
                  colorMapFunctionName:
                      this.props.wellLogView.props.colorMapFunctions?.[0]?.name,
                  inverseColorMapFunctionName: undefined,
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
        return dataNames(
            this.props.wellLogView.wellLogSets,
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
                    {insertEmpty === true ? "\u2014" : insertEmpty}
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

    createSelectControlFromType(type?: TemplatePlotType): ReactNode {
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
            const colorMapFunctions =
                this.props.wellLogView.props.colorMapFunctions;
            return [
                this.createSelectControl(
                    "colorMapFunctionName",
                    "Fill Color function/table",
                    createColorFunctionItems(colorMapFunctions)
                ),
                <FormControl fullWidth key="211" />,
                <FormControl fullWidth key="212" />,
                this.createSelectControl(
                    "inverseColorMapFunctionName",
                    "Inverse Color function/table",
                    createColorFunctionItems(colorMapFunctions),
                    true
                ),
            ];
        }

        return [];
    }

    render(): JSX.Element {
        const trackTemplate = getTrackTemplate(this.props.track);
        const title = this.props.templatePlot ? "Edit plot" : "Add New Plot";
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
