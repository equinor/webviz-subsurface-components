import React, { Component, ReactNode } from "react";

import {TemplatePlot} from "./WellLogTemplateTypes";

import {Track, GraphTrack} from "@equinor/videx-wellog";

import WellLogView from "./WellLogView"


// material ui
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl, InputLabel, NativeSelect 
} from '@material-ui/core';

interface PlotPropertiesDialogProps {
    templatePlot?: TemplatePlot; // input for editting
    onOK: (templatePlot: TemplatePlot) => void;
    wellLogView: WellLogView;
    track: Track;
    //type: string;
    //plotName?: string;
}
interface PlotPropertiesDialogState extends TemplatePlot {
    open: boolean;
}

export class PlotPropertiesDialog extends Component<PlotPropertiesDialogProps, PlotPropertiesDialogState> {
    constructor(props: PlotPropertiesDialogProps) {
        super(props);

        this.state = this.props.templatePlot ?
            {
                ...this.props.templatePlot,

                open: true
            } :
            {
                type: "line", //??
                name: "DEPT", //??
                name2: "DVER", //?

                color: "black", //??
                fill: "red",
                colorTable: "Physics",

                open: true
            }
        this.closeDialog = this.closeDialog.bind(this);
        this.onOK = this.onOK.bind(this);

        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleDataChange = this.handleDataChange.bind(this);
        this.handleDataChange2 = this.handleDataChange2.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleFillColorChange = this.handleFillColorChange.bind(this);
        this.handleColorTableChange = this.handleColorTableChange.bind(this);
    }

    onOK() {
        this.props.onOK(this.state);
        this.closeDialog()
    }

    closeDialog() {
        this.setState({ open: false });
    }

    handleTypeChange(event) {
        const type = event.currentTarget.value;
        const template = this.props.wellLogView.props.template;
        template.styles;
        this.setState({
            type: type,            
        })
        console.log("selectedOption", event.currentTarget.value)
    }
    handleDataChange(event) {
        this.setState({ name: event.currentTarget.value });
        console.log("selectedOption", event.currentTarget.value)
    }
    handleDataChange2(event) {
        this.setState({ name2: event.currentTarget.value });
        console.log("selectedOption2", event.currentTarget.value)
    }
    handleColorChange(event) {
        this.setState({ color: event.currentTarget.value } );
        console.log("selectedOption", event.currentTarget.value)
    }
    handleFillColorChange(event) {
        this.setState({fill: event.currentTarget.value });
        console.log("selectedOption", event.currentTarget.value)
    }
    handleColorTableChange(event) {
        this.setState({colorTable: event.currentTarget.value});
        console.log("selectedOption", event.currentTarget.value)
    }

    createDataItem(item: string): ReactNode {
        return (
            <option key={item}>
                {item}
            </option>
        );
    }

    createDataItems(): ReactNode[] {
        const nodes: ReactNode[] = [];
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
                } else if (abbr === curve.name) { // Scale tracks?
                    bUsed = true;
                }
                if (!bUsed)
                    nodes.push(this.createDataItem(curve.name));
                iCurve++;
            }
        }
        return nodes;
    }

    //{ this.props.wellLogView.logController.tracks }
    render() {
        return (
            <Dialog open={this.state.open} maxWidth="sm" fullWidth>
                <DialogTitle>{this.props.templatePlot ? "Edit plot" : "Add new plot"}</DialogTitle>
                <DialogContent style={{ display: "flex" }}>
                    <div style={{ width: "50%" }}>
                        <FormControl fullWidth>
                            <InputLabel>Data</InputLabel>
                            <NativeSelect
                                value={this.state.name}
                                onChange={this.handleDataChange}
                            >
                                {this.createDataItems()}
                            </NativeSelect>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>{this.state.type === "dot" ? "Dot Color" : "Line Color"}</InputLabel>
                            <NativeSelect
                                value={this.state.color}
                                onChange={this.handleColorChange}
                            >
                                <option value={"black"}>Black</option>
                                <option value={"red"}>Red</option>
                                <option value={"green"}>Green</option>
                                <option value={"blue"}>Blue</option>
                                <option value={"white"}>Whilte</option>
                            </NativeSelect>
                        </FormControl>

                    </div>
                    <div style={{ width: "50%" }}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <NativeSelect
                                value={this.state.type}
                                onChange={this.handleTypeChange}
                            >
                                <option value={"line"}>line</option>
                                <option value={"linestep"}>linestep</option>
                                <option value={"dot"}>dot</option>
                                <option value={"area"}>area</option>
                                <option value={"gradientfill"}>gradientfill</option>
                                <option value={"differential"}>differential</option>
                            </NativeSelect>
                        </FormControl>
                        {
                            this.state.type === "area" ?
                                <FormControl fullWidth>
                                    <InputLabel>Fill Color</InputLabel>
                                    <NativeSelect
                                        value={this.state.fill}
                                        onChange={this.handleFillColorChange}
                                    >
                                        <option value={"black"}>Black</option>
                                        <option value={"red"}>Red</option>
                                        <option value={"green"}>Green</option>
                                        <option value={"blue"}>Blue</option>
                                        <option value={"white"}>Whilte</option>
                                    </NativeSelect>
                                </FormControl>
                            :
                            this.state.type === "gradientfill" ?
                            <FormControl fullWidth>
                                <InputLabel>Fill Color table</InputLabel>
                                <NativeSelect
                                            value={this.state.colorTable}
                                            onChange={this.handleColorTableChange}
                                >
                                    <option>Physics</option>
                                    <option>Physics reverse</option>
                                    <option>Rainbow</option>
                                            <option>Rainbow reverse</option>
                                </NativeSelect>
                            </FormControl>
                                    : <></>
                        }
                        {(this.state.type === "differential") ?
                            <FormControl fullWidth>
                                <InputLabel>Data 2</InputLabel>
                                <NativeSelect
                                    value={this.state.name2}
                                    onChange={this.handleDataChange2}
                                >
                                    <option>DVER</option>
                                    <option>BDIA</option>
                                    <option>ROPA</option>
                                    <option>HKLA</option>
                                    <option>HKLX</option>
                                    <option>WOBA</option>
                                    <option>TQA</option>
                                    <option>TQX</option>
                                    <option>TQM</option>
                                    <option>MFIA</option>
                                </NativeSelect>
                            </FormControl>
                            : <></>
                        }

                    </div>

                </DialogContent>
                <DialogActions>
                    <Button color="secondary" variant="contained" onClick={this.closeDialog}>Cancel</Button>
                    <Button color="primary" variant="contained" onClick={this.onOK}>OK</Button>
                </DialogActions>
            </Dialog>
        );
    }
};


