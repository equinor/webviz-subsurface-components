import { clamp, isEqual } from "lodash";
import { type colorTablesArray } from "@emerson-eps/color-tables/";

import type {
    Accessor,
    AccessorContext,
    GetPickingInfoParams,
    Layer,
    LayersList,
    PickingInfo,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import type {
    LogCurveDataType,
    WellFeatureCollection,
    WellMdAccessor,
    WellTrajectoryAccessor,
} from "../types";
import type { PathLayerProps } from "@deck.gl/layers";
import { PathLayer } from "@deck.gl/layers";

import type { ColormapFunctionType } from "../../utils/colormapTools";
import type {
    ContinuousLegendDataType,
    DiscreteLegendDataType,
} from "../../../components/ColorLegend";
import { getPositionByMD } from "../utils/wells";
import {
    getCurveValueAtMd,
    getCurveValueAtRow,
    getLegendData,
    getLogColor,
    getLogMd,
    getLogSegmentIndex2,
    getLogWidth,
    injectMdRows,
} from "../utils/log";
import { getMdsInRange } from "../utils/trajectory";
import { getFromAccessor } from "../../utils/layerTools";
import type { Position } from "geojson";

export enum SubLayerId {
    CURVE = "curve",
    SELECTION = "selection",
}

export type LogIdentifier = { logRun: string; curveName: string };

export type LogCurveLayerProps = Omit<
    PathLayerProps<LogCurveDataType>,
    "getPath"
> & {
    trajectoryData: WellFeatureCollection;
    logWidth: number | "value";

    activeLog: LogIdentifier;

    domainSelection: {
        well: string;
        selection: number[];
    };

    colorScale: {
        name: string;
        isLogarithmic: boolean;
        colorTables: colorTablesArray;
        mappingFunction: ColormapFunctionType;
    };

    // Data-accessors
    getTrajectoryPath: WellTrajectoryAccessor;
    getWellMds: WellMdAccessor;

    // Callbacks
    onLogDataComputed: (data: LogCurveDataType[]) => void;
};

/** Aggregation layer for displaying Log Curves a long a well path */
export class LogCurveLayer extends CompositeLayer<LogCurveLayerProps> {
    static layerName = "Log Curve Layer";

    state!: {
        subLayerData: LogCurveDataType[] | null;
        legend?: string;

        domainSelection: {
            well: string;
            selection: number[];
        };
    };

    constructor(
        ...args: ConstructorParameters<
            typeof CompositeLayer<LogCurveLayerProps>
        >
    ) {
        super(...args);

        this._getFromSourceAccessor = this._getFromSourceAccessor.bind(this);
        this._logCurveIsVisible = this._logCurveIsVisible.bind(this);
        this.getCurveLayer = this.getCurveLayer.bind(this);
        this.getSelectionLayer = this.getSelectionLayer.bind(this);
    }

    updateState({
        props,
        oldProps,
        changeFlags,
    }: UpdateParameters<Layer<LogCurveLayerProps>>): void {
        if (!changeFlags.propsOrDataChanged) return;
        if (!this.isLoaded) return;
        if (!props.data) return;

        if (!isEqual(props.domainSelection, oldProps.domainSelection)) {
            this.setState({ domainSelection: props.domainSelection });
        }

        if (
            props.data === oldProps.data &&
            props.trajectoryData === oldProps.trajectoryData
        )
            return;

        // Deck.gl ensures data is a loaded array at this point
        const layerData = props.data as LogCurveDataType[];

        const subLayerData: LogCurveDataType[] = [];

        // Iterate over data to create subLayer data
        layerData.forEach((d) => {
            const wellFeatureIndex = props.trajectoryData.features.findIndex(
                (f) => f.properties.name === d.header.well
            );
            const wellFeatureObject =
                props.trajectoryData.features[wellFeatureIndex];

            const extendedLog = injectMdRows(
                d,
                ...wellFeatureObject.properties.md[0]
            );

            subLayerData.push(
                // this.getSubLayerRow(d, wellFeatureObject, wellFeatureIndex)
                this.getSubLayerRow(
                    extendedLog,
                    wellFeatureObject,
                    wellFeatureIndex
                )
            );
        });

        this.props.onLogDataComputed?.(subLayerData);
        this.setState({ subLayerData });
    }

    setLegend(value: LogCurveDataType[]): void {
        this.setState({
            legend: this.getLegendData(value),
        });
    }

    getLegendData(
        value: LogCurveDataType[]
    ): ContinuousLegendDataType | DiscreteLegendDataType | null {
        return getLegendData(
            value,
            "",
            this.props.activeLog.logRun,
            this.props.colorScale.name
        );
    }

    getCurveLayer() {
        return this.getSubLayers().find(
            (l) => l.id === this.getSubLayerProps({ id: SubLayerId.CURVE }).id
        );
    }

    getSelectionLayer() {
        return this.getSubLayers().find(
            (l) =>
                l.id === this.getSubLayerProps({ id: SubLayerId.SELECTION }).id
        );
    }

    // By default, the picking info would be the well feature, since we used getSubLayerRow
    // So we override it to return the log data instead
    getPickingInfo({ info }: GetPickingInfoParams): PickingInfo {
        return info;
    }

    private _getFromSourceAccessor<In, Out>(
        accessor: Accessor<In, Out>,
        d: LogCurveDataType,
        ctx: AccessorContext<LogCurveDataType>
    ): Out {
        // ! deck.gl does not transform the typing to the correct `In` type
        const sourceAccessor = this.getSubLayerAccessor(accessor) as Accessor<
            LogCurveDataType,
            Out
        >;

        return getFromAccessor(sourceAccessor, d, ctx);
    }

    private _logCurveIsVisible(
        d: LogCurveDataType,
        ctx: AccessorContext<LogCurveDataType>
    ): boolean {
        const { activeLog, getTrajectoryPath } = this.props;

        if (!activeLog) return false;

        const sourcePath = this._getFromSourceAccessor(
            getTrajectoryPath,
            d,
            ctx
        );

        return Boolean(sourcePath?.length);
    }

    renderLayers(): Layer | null | LayersList {
        const { getTrajectoryPath, getWellMds } = this.props;

        const sharedProps: Partial<PathLayerProps> = {
            data: this.state.subLayerData,
            widthScale: 10,
            widthMinPixels: 1,
            miterLimit: 1000,
        };

        return [
            new PathLayer<LogCurveDataType>({
                ...this.getSubLayerProps({
                    ...sharedProps,
                    id: SubLayerId.CURVE,
                    pickable: true,
                    updateTriggers: {
                        getPath: [
                            this.props.activeLog?.logRun,
                            this.props.trajectoryData,
                            this.props.positionFormat,
                        ],
                        getColor: [
                            this.props.activeLog?.logRun,
                            this.props.activeLog?.curveName,
                            this.props.colorScale.name,
                            this.props.colorScale.colorTables,
                            this.props.colorScale.isLogarithmic,
                            this.props.colorScale.mappingFunction,
                        ],
                        getWidth: [
                            this.props.activeLog?.logRun,
                            this.props.activeLog?.curveName,
                            this.props.logWidth,
                        ],
                    },
                }),

                // Using polygon offset to avoid z-fighting between the two layers. No actual clue how these numbers work, but this seemed to work
                getPolygonOffset: ({ layerIndex }) => [2, layerIndex],
                getPath: (d, ctx) => {
                    if (!this._logCurveIsVisible(d, ctx)) return [];
                    return getLogPath(
                        d,
                        this.props.activeLog?.logRun,
                        this._getFromSourceAccessor(getTrajectoryPath, d, ctx),
                        this._getFromSourceAccessor(getWellMds, d, ctx)
                    );
                },
                getColor: (d, ctx) => {
                    if (!this._logCurveIsVisible(d, ctx)) return [];
                    return getLogColor(
                        d,
                        this.props.activeLog?.logRun,
                        this.props.activeLog?.curveName,
                        this.props.colorScale.name,

                        // This is from the context, should it just be inferred from the lifecycle?
                        this.props.colorScale.colorTables,
                        this.props.colorScale.mappingFunction,
                        this.props.colorScale.isLogarithmic
                    );
                },
                getWidth:
                    this.props.logWidth !== "value"
                        ? this.props.logWidth
                        : (d, ctx) => {
                              if (!this._logCurveIsVisible(d, ctx)) return [];
                              return getLogWidth(
                                  d,
                                  this.props.activeLog?.logRun,
                                  this.props.activeLog?.curveName
                              );
                          },
            }),
            new PathLayer<LogCurveDataType>({
                ...this.getSubLayerProps({
                    ...sharedProps,
                    id: SubLayerId.SELECTION,
                    widthScale: sharedProps.widthScale! * 1.5,
                    updateTriggers: {
                        getWidth: [
                            this.props.logWidth,
                            this.props.activeLog?.logRun,
                            this.props.activeLog?.curveName,
                            this.state.domainSelection?.well,
                            this.state.domainSelection?.selection,
                        ],
                        getColor: [
                            this.props.activeLog?.logRun,
                            this.state.domainSelection?.well,
                            this.state.domainSelection?.selection,
                        ],
                        getPath: [
                            this.props.activeLog?.logRun,
                            this.state.domainSelection?.well,
                            this.state.domainSelection?.selection,
                        ],
                    },
                }),
                // Using polygon offset to avoid z-fighting between the two layers. No actual clue how these numbers work, but this seemed to work
                getPolygonOffset: ({ layerIndex }) => [1, layerIndex * 1000],
                getPath: (d, ctx) => {
                    if (!this._logCurveIsVisible(d, ctx)) return [];
                    return getSelectionPath(
                        d,
                        this._getFromSourceAccessor(getTrajectoryPath, d, ctx),
                        this._getFromSourceAccessor(getWellMds, d, ctx),
                        this.props.activeLog?.logRun,
                        this.state.domainSelection?.well,
                        this.state.domainSelection?.selection
                    );
                },

                getColor: (d, ctx) => {
                    if (!this._logCurveIsVisible(d, ctx)) return [];
                    return getSelectionColor(
                        d,
                        this.props.activeLog?.logRun,
                        this.state.domainSelection?.well,
                        this.state.domainSelection?.selection
                    );
                },

                getWidth:
                    this.props.logWidth !== "value"
                        ? this.props.logWidth
                        : (d, ctx) => {
                              if (!this._logCurveIsVisible(d, ctx)) return [];
                              return getSelectionWidth(
                                  d,
                                  this.props.activeLog?.logRun,
                                  this.props.activeLog?.curveName,
                                  this.state.domainSelection?.well,
                                  this.state.domainSelection?.selection
                              );
                          },
            }),
        ];
    }
}

function getLogPath(
    d: LogCurveDataType,
    selectedLogRun: string | undefined,
    wellTrajectory: Position[],
    wellMds: number[]
) {
    if (!selectedLogRun) return [];
    if (!wellTrajectory?.length || !wellMds?.length) return [];

    const log_xyz: Position[] = [];
    const log_mds = getLogMd(d, selectedLogRun);
    log_mds.forEach((md) => {
        const xyz = getPositionByMD(wellTrajectory, wellMds, md);
        log_xyz.push(xyz);
    });

    return log_xyz;
}

function getSelectionMds(
    d: LogCurveDataType,
    logRunName: string | undefined,
    selectedWell: string | undefined,
    selectedRange: number[] | undefined
) {
    if (!logRunName || !selectedWell || !selectedRange) return [];
    if (selectedWell !== d.header.well) return [];

    const logMds = getLogMd(d, logRunName);
    const sanitizedRange = sanitizeSelectionRange(logMds, selectedRange);

    if (!sanitizedRange.length) return [];

    let [mdStart, mdEnd] = sanitizedRange;

    // Add caps; i.e. colored lines at start and end
    // ? Should be handled as a marker instead?
    const capWidth = 4;

    // Clamp start/end cap sections to avoid going beyond trajectory
    if (mdStart - capWidth <= logMds[0]) {
        mdStart = logMds[0] + capWidth;
    }

    if (mdEnd !== undefined && mdEnd + capWidth >= logMds.at(-1)!) {
        mdEnd = logMds.at(-1)! - capWidth;
    }

    // @ts-expect-error -- Allowed undefined
    if (mdEnd < mdStart) mdEnd = undefined;

    if (mdEnd === undefined) {
        return [mdStart - capWidth / 2, mdStart + capWidth / 2];
    } else {
        return [
            mdStart - capWidth,
            ...getMdsInRange(logMds, mdStart, mdEnd),
            mdEnd + capWidth,
        ];
    }
}

function getSelectionPath(
    d: LogCurveDataType,
    wellTrajectory: Position[],
    wellMds: number[],
    logRunName: string | undefined,
    selectedWell: string | undefined,
    selectedRange: number[] | undefined
) {
    if (!wellTrajectory?.length || !wellMds.length) return [];

    return getSelectionMds(d, logRunName, selectedWell, selectedRange).map(
        (md) => getPositionByMD(wellTrajectory, wellMds, md)
    );
}

function getSelectionColor(
    d: LogCurveDataType,
    logRunName: string | undefined,
    selectedWell: string | undefined,
    selectedRange: number[] | undefined
) {
    const [rangeStart, rangeEnd] = selectedRange ?? [];
    const swapped =
        rangeStart !== undefined &&
        rangeStart !== undefined &&
        rangeStart > rangeEnd;

    const startColor = swapped ? [0, 255, 0, 128] : [255, 0, 0, 128];
    const endColor = swapped ? [255, 0, 0, 128] : [0, 255, 0, 128];

    const selectionMds = getSelectionMds(
        d,
        logRunName,
        selectedWell,
        selectedRange
    );

    return selectionMds.map((_, idx) => {
        if (idx === 0) return startColor;
        if (idx === selectionMds.length - 2) return endColor;

        return [128, 128, 128, 128];
    });
}

const SELECTION_MIN_WIDTH = 1;

function getSelectionWidth(
    d: LogCurveDataType,
    logRunName: string | undefined,
    logCurveName: string | undefined,
    selectedWell: string | undefined,
    selectedRange: number[] | undefined
) {
    if (!logRunName || !logCurveName) return 0;
    const selectionMds = getSelectionMds(
        d,
        logRunName,
        selectedWell,
        selectedRange
    );

    if (!selectionMds.length) return [];

    // We'll only need to interpolate the values for the ends of the array, each other point will be in the log
    // The "caps" of the selection is currently a two-point line segment
    const logRowOffset = getLogSegmentIndex2(d, selectionMds[1]) - 2;

    return selectionMds.map((md, idx) => {
        let width = 0;

        if (idx > 1 && idx < selectionMds.length - 2) {
            width = getCurveValueAtRow(d, logCurveName, idx + logRowOffset);
        } else {
            // Interpolate ends of selection
            width = getCurveValueAtMd(d, logCurveName, md) ?? 0;
        }
        return Math.max(width, SELECTION_MIN_WIDTH);
    });
}
export function sanitizeSelectionRange(
    mdArray: number[],
    range: number[] | undefined
): number[] {
    if (mdArray.length < 2) return [];
    if (!range) return [];

    let start = range.at(0);
    let end = range.at(-1);

    if (start === undefined) return [];

    start = clamp(start, mdArray.at(0)!, mdArray.at(-1)!);

    if (end === undefined) return [start];

    end = clamp(end, mdArray.at(0)!, mdArray.at(-1)!);

    if (start === end) return [start];
    if (start > end) return [end, start];

    return [start, end];
}
