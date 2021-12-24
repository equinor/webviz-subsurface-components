import React, { Component, ReactNode } from "react";

import { LogViewer } from "@equinor/videx-wellog";
import { TrackMouseEvent } from "./WellLogView";

import WellLogView from "./WellLogView";

import { WellLog } from "./WellLogTypes";
import { Template } from "./WellLogTemplateTypes";
import { ColorTable } from "./ColorTableTypes";

import { WellLogController } from "./WellLogView";

import Scroller from "./Scroller";

interface Props {
    welllog: WellLog;
    template: Template;
    colorTables: ColorTable[];
    horizontal?: boolean;
    primaryAxis: string;

    axisTitles: Record<string, string>;
    axisMnemos: Record<string, string[]>;

    maxVisibleTrackNum?: number; // default is horizontal ? 3: 5
    maxContentZoom?: number; // default is 256

    // callbacks:
    onCreateController?: (controller: WellLogController) => void;
    onInfo?: (
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ) => void;

    onTrackScroll?: () => void; // called when track scrolling are changed
    onContentRescale?: () => void; // called when content zoom and scrolling are changed

    onTrackMouseEvent?: (wellLogView: WellLogView, ev: TrackMouseEvent) => void; // called when mouse click on a track
    onTemplateChanged?: () => void; // called when track scrolling are changed
}

class WellLogViewWithScroller extends Component<Props> {
    controller: WellLogController | null;
    scroller: Scroller | null;

    constructor(props: Props) {
        super(props);

        this.controller = null;
        this.scroller = null;

        this.onCreateController = this.onCreateController.bind(this);

        this.onScrollerScroll = this.onScrollerScroll.bind(this);
        this.onTrackScroll = this.onTrackScroll.bind(this);

        this.onContentRescale = this.onContentRescale.bind(this);
    }

    componentDidMount(): void {
        this.setScrollerPosAndZoom();
    }

    shouldComponentUpdate(nextProps: Props): boolean {
        {
            //compare (Object.keys(nextProps), Object.keys(this.props))
            for (const p in nextProps) {
                // eslint-disable-next-line
                if ((nextProps as any)[p] !== (this.props as any)[p]) {
                    //console.log(p /*, nextProps[p], this.props[p]*/);
                    return true;
                }
            }
        }
        return false;
    }

    updateReadoutPanel(): void {
        const controller = this.controller;
        if (controller)
            controller.selectContent(controller.getContentSelection()); // force to update readout panel
    }

    // callback function from WellLogView
    onCreateController(controller: WellLogController): void {
        this.controller = controller;
        if (this.props.onCreateController)
            // set callback to component's caller
            this.props.onCreateController(controller);
    }
    // callback function from WellLogView
    onTrackScroll(): void {
        this.setScrollerPosAndZoom();
    }
    // callback function from WellLogView
    onContentRescale(): void {
        this.setScrollerPosAndZoom();
        if (this.props.onContentRescale) this.props.onContentRescale();
    }

    // callback function from Scroller
    onScrollerScroll(x: number, y: number): void {
        const controller = this.controller;
        if (controller) {
            const fContent = this.props.horizontal ? x : y; // fraction
            controller.scrollContentTo(fContent);

            const posMax = controller.getTrackScrollPosMax();
            let posTrack = (this.props.horizontal ? y : x) * posMax;
            posTrack = Math.round(posTrack);
            controller.scrollTrackTo(posTrack);
        }
    }

    setScrollerPosAndZoom(): void {
        let x: number, y: number;
        let xZoom: number, yZoom: number;
        const scroller = this.scroller;
        if (!scroller) return;
        const controller = this.controller;
        if (!controller) {
            x = y = 0.0;
            xZoom = yZoom = 1.0;
        } else {
            const fContent = controller.getContentScrollPos(); // fraction
            const fTrack = controller.getTrackScrollPosMax()
                ? controller.getTrackScrollPos() /
                  controller.getTrackScrollPosMax()
                : 0.0; // fraction
            x = this.props.horizontal ? fContent : fTrack;
            y = this.props.horizontal ? fTrack : fContent;

            const contentZoom = controller.getContentZoom();
            const trackZoom = controller.getTrackZoom();
            xZoom = this.props.horizontal ? contentZoom : trackZoom;
            yZoom = this.props.horizontal ? trackZoom : contentZoom;
        }

        scroller.zoom(xZoom, yZoom);
        scroller.scrollTo(x, y);
    }

    render(): ReactNode {
        return (
            <Scroller
                //style={{ height: "100%", flex: "1 1 auto" }}
                ref={(el) => (this.scroller = el as Scroller)}
                onScroll={this.onScrollerScroll}
            >
                <WellLogView
                    welllog={this.props.welllog}
                    template={this.props.template}
                    colorTables={this.props.colorTables}
                    horizontal={this.props.horizontal}
                    maxVisibleTrackNum={this.props.maxVisibleTrackNum}
                    maxContentZoom={this.props.maxContentZoom}
                    primaryAxis={this.props.primaryAxis}
                    axisTitles={this.props.axisTitles}
                    axisMnemos={this.props.axisMnemos}
                    onInfo={this.props.onInfo}
                    onCreateController={this.onCreateController}
                    onTrackMouseEvent={this.props.onTrackMouseEvent}
                    onTrackScroll={this.onTrackScroll}
                    onContentRescale={this.onContentRescale}
                />
            </Scroller>
        );
    }
}

export default WellLogViewWithScroller;
