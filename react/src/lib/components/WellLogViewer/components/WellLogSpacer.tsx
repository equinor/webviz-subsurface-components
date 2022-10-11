import React, { Component, ReactNode } from "react";

import "!vue-style-loader!css-loader!sass-loader!./styles.scss";

import { WellLogController, WellPickProps, getWellPicks } from "./WellLogView";
import WellLogView from "./WellLogView";

import { ColorTable } from "./ColorTableTypes";

export interface PatternsTable {
    patternSize: number;
    patterns: string[];
    patternNames?: string[];
}

function patternId(uid: number, index: number) {
    return "pattern" + uid + "_" + index;
}

function createPattern(
    uid: number,
    index: number,
    patternsTable: PatternsTable
): ReactNode {
    const patternSize = patternsTable.patternSize;
    const pattern = patternsTable.patterns[index];
    const id = patternId(uid, index);
    return (
        <pattern
            key={id}
            id={id}
            width={patternSize}
            height={patternSize}
            patternUnits="userSpaceOnUse"
        >
            <image width={patternSize} height={patternSize} href={pattern} />
        </pattern>
    );
}

function createDefs(uid: number, patternsTable?: PatternsTable): ReactNode {
    if (!patternsTable) return null;
    return (
        <defs key="defs">
            {patternsTable.patterns.map((value: string, index: number) =>
                createPattern(uid, index, patternsTable)
            )}
        </defs>
    );
}

interface Props {
    width?: number;

    controllers: (WellLogController | null)[];

    /**
     * Prop containing color table data.
     */
    colorTables: ColorTable[];
    /**
     * Well Picks data
     */
    wellpicks?: WellPickProps[];

    patternsTable?: PatternsTable;
    patterns?: [string, number][];

    distance?: number;

    /**
     * Orientation of the track plots on the screen.
     */
    horizontal?: boolean;
    /**
     * Show Titles on the tracks
     */
    hideTitles?: boolean;
    /**
     * Hide Legends on the tracks
     */
    hideLegend?: boolean;

    onCreateSpacer?: (spacer: WellLogSpacer) => void;
}

//interface State {}

// see also colors in Overlays in WellLogView.ts
const selColor = "rgba(0, 0, 0, 0.1)";
const curColor = "rgba(255, 0, 0, 0.1)";
const pinColor = "rgba(0, 255, 0, 0.1)";

let count = 0;

class WellLogSpacer extends Component<Props /*, State*/> {
    container: HTMLElement | undefined = undefined;

    uid: number = count++; // generate some unique id prefix for pattern ids in SVGs

    defs: ReactNode;

    constructor(props: Props) {
        super(props);
        this.defs = createDefs(this.uid, this.props.patternsTable);
    }

    update(): void {
        this.forceUpdate();
    }

    componentDidUpdate(prevProps: Props /*, prevState: State*/): void {
        // Typical usage (don't forget to compare props):
        if (this.props.onCreateSpacer !== prevProps.onCreateSpacer) {
            // update callback to component's caller
            if (this.props.onCreateSpacer) this.props.onCreateSpacer(this);
        }
        if (this.props.patternsTable !== prevProps.patternsTable) {
            this.defs = createDefs(this.uid, this.props.patternsTable);
        }
    }

    shouldComponentUpdate(nextProps: Props /*, nextState: State*/): boolean {
        if (this.props.colorTables !== nextProps.colorTables) return true;
        if (this.props.controllers !== nextProps.controllers) return true;
        if (this.props.wellpicks !== nextProps.wellpicks) return true;

        return false;
    }

    render(): ReactNode {
        const horizontal = this.props.horizontal;

        let ymax = 0;
        const picks: {
            color: string;
            pattern: string;
            from: number;
            to: number;
        }[] = [];

        let offsetTop = 1157;
        let offsetLeft = 1157;
        let height = 1;
        let width = 1;
        const controller = this.props.controllers[0] as WellLogView;
        const logViewer = controller?.logController;
        const controller2 = this.props.controllers[1] as WellLogView;
        const logViewer2 = controller2?.logController;
        const wps = controller ? getWellPicks(controller) : null;
        const wps2 = controller2 ? getWellPicks(controller2) : null;
        if (wps && wps2 && logViewer) {
            const overlay = logViewer?.overlay;
            const source = overlay?.elm.node();

            if (source) {
                offsetTop = source.offsetTop;
                offsetLeft = source.offsetLeft;
                height = source.clientHeight;
                width = source.clientWidth;
            }
            if (horizontal)
                height = this.container ? this.container.clientHeight : 10;
            else width = this.container ? this.container.clientWidth : 10;

            //const wpSize = 3; //9;
            //const offset = wpSize / 2;

            for (const wp of wps) {
                const horizon = wp.horizon;
                const vPrimary = wp.vPrimary;
                const color = wp.color;

                const rgba =
                    "rgba(" +
                    color[0] +
                    "," +
                    color[1] +
                    "," +
                    color[2] +
                    ",0.8)";

                let pattern = "";

                if (this.props.patterns) {
                    const p = this.props.patterns.find(
                        (val) => val[0] === horizon
                    );
                    if (p) {
                        pattern = "url(#" + patternId(this.uid, p[1]) + ")";
                    }
                }

                const vCur = vPrimary;
                if (vCur === undefined) continue;
                const v = logViewer?.scale(vCur);
                if (!Number.isFinite(v) || v === undefined) continue;

                for (const wp2 of wps2) {
                    const horizon2 = wp2.horizon;
                    if (horizon === horizon2) {
                        const vPrimary2 = wp2.vPrimary;

                        const vCur2 = vPrimary2;
                        if (vCur2 === undefined) continue;
                        const v2 = logViewer2?.scale(vCur2);
                        if (!Number.isFinite(v2) || v2 === undefined) continue;
                        if (ymax < v) ymax = v;
                        if (ymax < v2) ymax = v2;

                        picks.push({
                            from: v,
                            to: v2,
                            color: rgba,
                            pattern: pattern,
                        });

                        break;
                    }
                }
            }
        }

        const _selection = controller?.getContentSelection();
        const _selection2 = controller2?.getContentSelection();

        const selection: {
            from: number | undefined;
            to: number | undefined;
        }[] = [
            {
                from:
                    _selection?.[0] === undefined
                        ? undefined
                        : logViewer?.scale(_selection?.[0]),
                to:
                    _selection2?.[0] === undefined
                        ? undefined
                        : logViewer2?.scale(_selection2?.[0]),
            },
            {
                from:
                    _selection?.[1] === undefined
                        ? undefined
                        : logViewer?.scale(_selection?.[1]),
                to:
                    _selection2?.[1] === undefined
                        ? undefined
                        : logViewer2?.scale(_selection2?.[1]),
            },
        ];

        if (
            selection[0].from !== undefined &&
            selection[1].from !== undefined &&
            selection[0].to !== undefined &&
            selection[1].to !== undefined
        )
            if (
                selection[0].from < selection[1].from !==
                selection[0].to < selection[1].to
            ) {
                const tmp = selection[0].to;
                selection[0].to = selection[1].to;
                selection[1].to = tmp;
            }

        const from0 = selection[0]?.from?.toFixed(1);
        const to0 = selection[0]?.to?.toFixed(1);
        const from1 = selection[1]?.from?.toFixed(1);
        const to1 = selection[1]?.to?.toFixed(1);

        const hasSelection0 = from0 !== undefined && to0 !== undefined;
        const hasSelection1 = from1 !== undefined && to1 !== undefined;
        const hasSelection = hasSelection0 && hasSelection1;

        let selectionPoints = "";
        let d1 = "";
        let d0 = "";
        if (hasSelection0) {
            d0 = horizontal
                ? "M " + from0 + " 0 L " + to0 + " " + height
                : "M 0 " + from0 + " L " + width + " " + to0;
        }
        if (hasSelection1) {
            d1 = horizontal
                ? "M " + from1 + " 0 L " + to1 + " " + height
                : "M 0 " + from1 + " L " + width + " " + to1;
        }
        if (hasSelection) {
            selectionPoints = horizontal
                ? from0 +
                  " 0 " +
                  to0 +
                  " " +
                  height +
                  " " +
                  to1 +
                  (" " + height + " " + from1 + " 0")
                : "0 " +
                  from0 +
                  " " +
                  width +
                  " " +
                  to0 +
                  (" " + width + " " + to1 + " 0 " + from1);
        }

        const fillPoints: string[] = [];
        picks.map((value, index) => {
            if (index + 1 >= picks.length) return;
            const value1 = picks[index + 1];
            fillPoints.push(
                horizontal
                    ? value.from.toFixed(1) +
                          " 0 " +
                          value.to.toFixed(1) +
                          " " +
                          height +
                          " " +
                          (value1.to.toFixed(1) +
                              " " +
                              height +
                              " " +
                              value1.from.toFixed(1) +
                              " 0")
                    : "0 " +
                          value.from.toFixed(1) +
                          " " +
                          width +
                          " " +
                          value.to.toFixed(1) +
                          " " +
                          (width +
                              " " +
                              value1.to.toFixed(1) +
                              " 0 " +
                              value1.from.toFixed(1))
            );
        });

        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: horizontal ? "row" : "column",
                }}
                ref={(el) => (this.container = el as HTMLElement)}
            >
                <div
                    style={
                        horizontal
                            ? {
                                  writingMode: horizontal
                                      ? "vertical-lr"
                                      : undefined,
                                  transform: horizontal
                                      ? "rotate(180deg)"
                                      : undefined,
                                  width: offsetLeft + "px",
                                  height: height + "px",
                              }
                            : { height: offsetTop + "px", width: width + "px" }
                    }
                >
                    {!this.props.hideTitles ? <br /> : null}
                    {!this.props.hideLegend &&
                    this.props.distance !== undefined ? (
                        <div style={{ fontSize: 12, textAlign: "center" }}>
                            {"←" + this.props.distance.toFixed(0) + "m→"}
                        </div>
                    ) : null}
                </div>
                <div
                    style={
                        horizontal
                            ? { height: height + "px" }
                            : { width: width + "px" }
                    }
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox={"0 0 " + width + " " + height}
                        width={width}
                        height={height}
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        {this.defs}
                        {picks.map(
                            (value, index) =>
                                index + 1 < picks.length && [
                                    value.color && (
                                        <polygon
                                            key={index}
                                            fill={value.color}
                                            stroke="none"
                                            points={fillPoints[index]}
                                        />
                                    ),
                                    value.pattern && (
                                        <polygon
                                            key={"p" + index}
                                            fill={value.pattern}
                                            fillOpacity={0.45}
                                            stroke="none"
                                            points={fillPoints[index]}
                                        />
                                    ),
                                ]
                        )}
                        {picks.map((value, index) => (
                            <path
                                key={index}
                                fill="none"
                                stroke={value.color}
                                d={
                                    horizontal
                                        ? "M " +
                                          value.from.toFixed(1) +
                                          "0 L " +
                                          value.to.toFixed(1) +
                                          " " +
                                          height
                                        : "M 0 " +
                                          value.from.toFixed(1) +
                                          " L " +
                                          width +
                                          " " +
                                          value.to.toFixed(1)
                                }
                            />
                        ))}

                        {hasSelection && (
                            <polygon
                                fill={selColor}
                                stroke="none"
                                points={selectionPoints}
                            />
                        )}

                        {hasSelection0 && (
                            <path fill="none" stroke={curColor} d={d0} />
                        )}

                        {hasSelection1 && (
                            <path fill="none" stroke={pinColor} d={d1} />
                        )}
                    </svg>
                </div>
            </div>
        );
    }
}

export default WellLogSpacer;
