import type { ReactNode } from "react";
import React, { Component } from "react";

import type { WellLogController, WellPickProps } from "./WellLogView";
import { getWellPicks } from "./WellLogView";
import type WellLogView from "./WellLogView";

import type { ColorMapFunction } from "./ColorMapFunction";
import type { PatternsTable, Pattern } from "../utils/pattern";
import { createDefs, patternId } from "../utils/pattern";

export interface WellLogSpacerOptions {
    /**
     * Fill with color between well picks
     */
    wellpickColorFill?: boolean;
    /**
     * Fill with pattern between well picks
     */
    wellpickPatternFill?: boolean;
}

export interface WellLogSpacerProps {
    width?: number;

    controllers: (WellLogController | null)[]; // 2 items

    /**
     * Prop containing color function/table data.
     */
    colorMapFunctions: ColorMapFunction[];
    /**
     * Well Picks data
     */
    wellpicks?: WellPickProps[];

    /**
     * Patterns table
     */
    patternsTable?: PatternsTable;

    /**
     * Horizon to pattern index map
     */
    patterns?: Pattern[];

    /**
     * Distanse between wells to show on the spacer
     */
    distance?: {
        units: string;
        value: number | undefined;
    };

    /**
     * Orientation of the track plots on the screen.
     */
    horizontal?: boolean;

    /**
     * Additional options
     */
    options?: WellLogSpacerOptions;

    onCreateSpacer?: (spacer: WellLogSpacer) => void;
}

//interface State {}

// see also colors in Overlays in WellLogView.ts
const selColor = "rgba(0, 0, 0, 0.1)";
const curColor = "rgba(255, 0, 0, 0.1)";
const pinColor = "rgba(0, 255, 0, 0.1)";

let count = 0;

class WellLogSpacer extends Component<WellLogSpacerProps /*, State*/> {
    container: HTMLElement | undefined = undefined;

    uid: number = count++; // generate some unique id prefix for pattern ids in SVGs

    defs: ReactNode;
    _isMount: boolean;

    constructor(props: WellLogSpacerProps) {
        super(props);
        this.defs =
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.options?.wellpickPatternFill &&
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.patterns && // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            createDefs(this.uid, this.props.patternsTable);

        this._isMount = false;
    }

    update(): void {
        if (this._isMount) this.forceUpdate();
    }

    componentDidUpdate(
        prevProps: WellLogSpacerProps /*, prevState: State*/
    ): void {
        // called after render()!?
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (this.props.onCreateSpacer !== prevProps.onCreateSpacer) {
            // update callback to component's caller
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.onCreateSpacer?.(this);
        }
        if (
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.patternsTable !== prevProps.patternsTable ||
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.patterns !== prevProps.patterns || // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.options?.wellpickPatternFill !== // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                prevProps.options?.wellpickPatternFill
        ) {
            this.defs =
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                this.props.options?.wellpickPatternFill &&
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                this.props.patterns && // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                createDefs(this.uid, this.props.patternsTable);

            this.forceUpdate(); // force to show pattern fill with new this.defs
        }
    }

    shouldComponentUpdate(
        nextProps: WellLogSpacerProps /*, nextState: State*/
    ): boolean {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (this.props.colorMapFunctions !== nextProps.colorMapFunctions) {
            return true;
        }
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (this.props.controllers !== nextProps.controllers) {
            return true;
        }
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (this.props.wellpicks !== nextProps.wellpicks) {
            return true;
        }
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        if (this.props.width !== nextProps.width) {
            return true;
        }

        if (
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.options?.wellpickColorFill !== // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            nextProps.options?.wellpickColorFill
        )
            return true;
        if (
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            this.props.options?.wellpickPatternFill !== // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line react/prop-types
            nextProps.options?.wellpickPatternFill
        ) {
            return true;
        }

        return false;
    }

    componentDidMount(): void {
        this._isMount = true;
    }
    componentWillUnmount(): void {
        this._isMount = false;
    }

    render(): JSX.Element {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const horizontal = this.props.horizontal;

        let ymax = 0;
        const picks: {
            color: string;
            pattern: string;
            from: number;
            to: number;
        }[] = [];

        let offsetTop = 3000; // try to draw initially out of screen
        let offsetLeft = 3000;
        let height = 1;
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        let width = this.props.width ?? 1;
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const controller = this.props.controllers[0] as unknown as WellLogView;
        const logViewer = controller?.logController;
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const controller2 = this.props.controllers[1] as unknown as WellLogView;
        const logViewer2 = controller2?.logController;
        const wps = controller ? getWellPicks(controller) : null;
        const wps2 = controller2 ? getWellPicks(controller2) : null;
        if (wps && wps2 && logViewer) {
            const overlay = logViewer?.overlay;
            const source = overlay?.elm.node();
            if (source) {
                offsetTop = source.offsetTop;
                offsetLeft = source.offsetLeft;
                if (source.offsetParent) {
                    if (!horizontal) offsetTop += source.offsetParent.offsetTop;
                    else offsetLeft += source.offsetParent.offsetLeft;
                }
                height = source.clientHeight;
                width = source.clientWidth;
            }
            if (horizontal)
                height = this.container ? this.container.clientHeight : 10;
            else width = this.container ? this.container.clientWidth : 10;

            //const wpSize = 3; //9;
            //const offset = wpSize / 2;

            const patterns =
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                this.props.options?.wellpickPatternFill &&
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                this.props.patternsTable && // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line react/prop-types
                this.props.patterns;

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
                    ",0.8)"; /*TODO: get from CSS ???*/

                let pattern = "";
                if (patterns) {
                    const p = patterns.find((val) => val[0] === horizon);
                    if (p) pattern = "url(#" + patternId(this.uid, p[1]) + ")";
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

        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const distance = this.props.distance;

        return (
            <div
                className="welllogspacer" // for CSS customization
                style={{ flexDirection: horizontal ? "row" : "column" }}
                ref={(el) => (this.container = el as HTMLElement)}
            >
                <div
                    className={
                        horizontal ? "welllogspacer-distance-horizontal" : ""
                    }
                    style={
                        horizontal
                            ? {
                                  width: offsetLeft + "px",
                                  height: height + "px",
                              }
                            : { height: offsetTop + "px", width: width + "px" }
                    }
                >
                    {!controller?.props.options?.hideTrackTitle ? <br /> : null}
                    {!controller?.props.options?.hideTrackLegend &&
                    distance !== undefined &&
                    // TODO: Fix this the next time the file is edited.
                    // eslint-disable-next-line react/prop-types
                    distance.value !== undefined ? (
                        <div className="distance">
                            {"←" +
                                // TODO: Fix this the next time the file is edited.
                                // eslint-disable-next-line react/prop-types
                                distance.value.toFixed(0) +
                                // TODO: Fix this the next time the file is edited.
                                // eslint-disable-next-line react/prop-types
                                distance.units +
                                "→"}
                        </div>
                    ) : null}
                </div>
                <div
                    className="wellpick" // for CSS customization
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
                                    // TODO: Fix this the next time the file is edited.
                                    // eslint-disable-next-line react/prop-types
                                    this.props.options?.wellpickColorFill &&
                                        value.color && (
                                            <polygon
                                                key={index}
                                                fill={value.color}
                                                className="wellpick-fill" // for CSS customization
                                                stroke="none"
                                                points={fillPoints[index]}
                                            />
                                        ),
                                    value.pattern && (
                                        <polygon
                                            key={"p" + index}
                                            fill={value.pattern}
                                            className="wellpick-pattern" // for CSS customization
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
