import type { Color } from "@deck.gl/core";
import {
    type colorTablesArray,
    rgbValues,
    getColors,
} from "@emerson-eps/color-tables/";
import type { Position } from "geojson";

import {
    type PropertyDataType,
    createPropertyData,
} from "../../utils/layerTools";
import type { ColorAccessor, LogCurveDataType, WellFeature } from "../types";
import { type WellsLayerProps } from "../wellsLayer";
import { getSegmentIndex } from "./trajectory";
import { getPositionByMD, getWellMds, getWellObjectByName } from "./wells";
import type {
    ContinuousLegendDataType,
    DiscreteLegendDataType,
} from "../../../components/ColorLegend";

import { getTrajectory } from "./trajectory";

const MD_CURVE_NAMES = ["DEPTH::", "DEPT", "MD", "TDEP", "MD_RKB"]; // aliases for MD

export function getLogForWellbore(
    logs: LogCurveDataType[],
    logRunName: string,
    wellName: string
) {
    for (const log of logs) {
        const { name, well } = log.header;

        if (name === logRunName && well == wellName) {
            return log;
        }
    }

    return undefined;
}

export function getLogIndexByName(
    d: LogCurveDataType,
    log_name: string
): number {
    const name = log_name.toLowerCase();
    return d.curves.findIndex((item) => item.name.toLowerCase() === name);
}

export function getLogIndexByNames(
    d: LogCurveDataType,
    names: string[]
): number {
    for (const name of names) {
        const index = getLogIndexByName(d, name);
        if (index >= 0) return index;
    }
    return -1;
}

export function isSelectedLogRun(
    d: LogCurveDataType,
    logrun_name: string
): boolean {
    return d.header.name.toLowerCase() === logrun_name.toLowerCase();
}

export function getLogValues(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string
): number[] {
    if (!isSelectedLogRun(d, logrun_name)) return [];

    const log_id = getLogIndexByName(d, log_name);
    return log_id >= 0 ? getColumn(d.data, log_id) : [];
}

export function getLogInfo(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string
): { name: string; description: string } | undefined {
    if (!isSelectedLogRun(d, logrun_name)) return undefined;

    const log_id = getLogIndexByName(d, log_name);
    return d.curves[log_id];
}

export function getDiscreteLogMetadata(d: LogCurveDataType, log_name: string) {
    return d?.metadata_discrete[log_name];
}

export function getLogSegmentIndexForMd(
    log: LogCurveDataType,
    md: number
): number {
    const mdCurveIndex = getLogIndexByNames(log, MD_CURVE_NAMES);

    if (md < log.data[0][mdCurveIndex]) return -1;
    if (md > log.data.at(-1)![mdCurveIndex]) return -1;

    // Special case to include the last md within the last segment
    if (md === log.data.at(-1)![mdCurveIndex]) return log.data.length - 2;

    for (
        let segmentIndex = 0;
        segmentIndex < log.data.length - 1;
        segmentIndex++
    ) {
        const segmentStart = log.data[segmentIndex][mdCurveIndex];
        const segmentEnd = log.data[segmentIndex + 1][mdCurveIndex];

        if (md < segmentStart) continue;
        if (md >= segmentStart && md < segmentEnd) return segmentIndex;
    }

    return -1;
}

// Returns segment index of discrete logs
function getLogSegmentIndex(
    coord: Position,
    wells_data: WellFeature[],
    log_data: LogCurveDataType,
    logrun_name: string
): number {
    const trajectory = getLogPath(wells_data, log_data, logrun_name);
    return getSegmentIndex(coord, trajectory);
}

export function getLogProperty(
    coord: Position,
    wells_data: WellFeature[],
    log_data: LogCurveDataType,
    logrun_name: string,
    log_name: string
): PropertyDataType | null {
    if (!log_data.data) return null;

    const segment_index = getLogSegmentIndex(
        coord,
        wells_data,
        log_data,
        logrun_name
    );
    let log_value: number | string = getLogValues(
        log_data,
        logrun_name,
        log_name
    )[segment_index];

    let dl_attrs: [string, [Color, number]] | undefined = undefined;
    const dl_metadata = getDiscreteLogMetadata(log_data, log_name)?.objects;
    if (dl_metadata) {
        dl_attrs = Object.entries(dl_metadata).find(
            ([, value]) => value[1] == log_value
        );
    }

    const log = getLogInfo(log_data, logrun_name, log_name)?.name;
    const prop_name = log + " " + log_data.header.well;
    log_value = dl_attrs ? dl_attrs[0] + " (" + log_value + ")" : log_value;

    if (log_value) {
        const well_object = getWellObjectByName(
            wells_data,
            log_data.header.well
        );
        return createPropertyData(
            prop_name,
            log_value,
            well_object?.properties?.["color"]
        );
    } else return null;
}

export function getLogWidth(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string
): number[] {
    return getLogValues(d, logrun_name, log_name);
}

// Return data required to build well layer legend
export function getLegendData(
    logs: LogCurveDataType[],
    wellName: string,
    logName: string,
    logColor: string
): ContinuousLegendDataType | DiscreteLegendDataType | null {
    if (!logs) return null;
    const log = wellName
        ? logs.find((log) => log.header.well == wellName)
        : logs[0];
    const logInfo = !log
        ? undefined
        : getLogInfo(log, log.header.name, logName);
    const title = "Wells / " + logName;
    if (log && logInfo?.description == "discrete") {
        const meta = log["metadata_discrete"];
        const metadataDiscrete = meta[logName].objects;
        return {
            title: title,
            colorName: logColor,
            discrete: true,
            metadata: metadataDiscrete,
        };
    } else {
        const minArray: number[] = [];
        const maxArray: number[] = [];
        logs.forEach(function (log: LogCurveDataType) {
            const logValues = getLogValues(log, log.header.name, logName);
            minArray.push(Math.min(...logValues));
            maxArray.push(Math.max(...logValues));
        });
        return {
            title: title,
            colorName: logColor,
            discrete: false,
            valueRange: [Math.min(...minArray), Math.max(...maxArray)],
        };
    }
}

export function getLogMd(d: LogCurveDataType, logrun_name: string): number[] {
    if (!isSelectedLogRun(d, logrun_name)) return [];

    const log_id = getLogIndexByNames(d, MD_CURVE_NAMES);
    return log_id >= 0 ? getColumn(d.data, log_id) : [];
}

export function getCurveValueAtRow(
    log: LogCurveDataType,
    curveName: string,
    rowIndex: number
) {
    const curveIndex = getLogIndexByName(log, curveName);
    return log.data[rowIndex][curveIndex];
}

export function getCurveValueAtMd(
    log: LogCurveDataType,
    curveName: string,
    md: number
): number | null {
    const mdCurveIndex = getLogIndexByNames(log, MD_CURVE_NAMES);
    const curveIndex = getLogIndexByName(log, curveName);

    if (mdCurveIndex < 0 || curveIndex < 0) return null;
    if (md < log.data[0][mdCurveIndex]) return null;
    if (md > log.data[log.data.length - 1][mdCurveIndex]) return null;

    const segmentIndex = log.data.findIndex((row) => row[mdCurveIndex] > md);

    if (segmentIndex === -1) return null;

    const mdBelow = log.data[segmentIndex - 1][mdCurveIndex];
    const mdAbove = log.data[segmentIndex][mdCurveIndex];

    const interpolatedT = (md - mdBelow) / (mdAbove - mdBelow);

    if (log.curves[curveIndex].description === "continuous") {
        const valueBelow = log.data[segmentIndex - 1][curveIndex];
        const valueAbove = log.data[segmentIndex][curveIndex];

        return valueBelow + interpolatedT * (valueAbove - valueBelow);
    } else {
        const valueBelow = log.data[segmentIndex - 1][curveIndex];
        return valueBelow;
    }
}

export function injectMdRows(
    log: LogCurveDataType,
    ...mdValues: number[]
): LogCurveDataType {
    const newData = [...log.data];

    const mdCurveIndex = getLogIndexByNames(log, MD_CURVE_NAMES);

    let currentDataRowIdx = 0;
    let spliceCount = 0;

    for (let i = 0; i < mdValues.length; i++) {
        const mdValue = mdValues[i];
        if (mdValue < log.data[0][mdCurveIndex]) continue;
        if (mdValue > log.data[log.data.length - 1][mdCurveIndex]) break;

        // Increase until we go over or find the value
        while (
            log.data[currentDataRowIdx][mdCurveIndex] < mdValue &&
            currentDataRowIdx < log.data.length
        ) {
            currentDataRowIdx++;
        }

        if (currentDataRowIdx >= log.data.length) break;

        // Data already in array, so we can skip
        if (log.data[currentDataRowIdx][mdCurveIndex] === mdValue) continue;

        const mdBelow = log.data[currentDataRowIdx - 1][mdCurveIndex];
        const mdAbove = log.data[currentDataRowIdx][mdCurveIndex];

        const interpolatedT = (mdValue - mdBelow) / (mdAbove - mdBelow);

        const interpolatedRow = [];

        for (
            let colIdx = 0;
            colIdx < log.data[currentDataRowIdx].length;
            colIdx++
        ) {
            if (colIdx === mdCurveIndex) {
                interpolatedRow.push(mdValue);
            } else if (log.curves[colIdx].description === "continuous") {
                const valueBelow = log.data[currentDataRowIdx - 1][colIdx];
                const valueAbove = log.data[currentDataRowIdx][colIdx];
                const interpolatedValue =
                    valueBelow + interpolatedT * (valueAbove - valueBelow);
                interpolatedRow.push(interpolatedValue);
            } else {
                const valueBelow = log.data[currentDataRowIdx - 1][colIdx];
                interpolatedRow.push(valueBelow);
            }
        }

        newData.splice(currentDataRowIdx + spliceCount, 0, interpolatedRow);
        spliceCount++;
    }

    return {
        ...log,
        data: newData,
    };
}

export function getLogColor(
    d: LogCurveDataType,
    logrun_name: string,
    log_name: string,
    logColor: string,
    colorTables: colorTablesArray,
    colorMappingFunction: WellsLayerProps["colorMappingFunction"],
    isLog: boolean
): Color[] {
    const log_data = getLogValues(d, logrun_name, log_name);
    const log_info = getLogInfo(d, logrun_name, log_name);
    if (log_data.length == 0 || log_info == undefined) return [];
    const log_color: Color[] = [];

    if (log_info.description == "continuous") {
        const min = Math.min(...log_data);
        const max = Math.max(...log_data);
        const max_delta = max - min;
        log_data.forEach((value) => {
            const adjustedVal = (value - min) / max_delta;

            const rgb = colorMappingFunction
                ? colorMappingFunction(adjustedVal)
                : rgbValues(adjustedVal, logColor, colorTables, isLog);

            if (rgb) {
                log_color.push([rgb[0], rgb[1], rgb[2]]);
            } else {
                log_color.push([0, 0, 0, 0]); // push transparent for null/undefined log values
            }
        });
    } else {
        // well log data set for ex : H1: Array(2)0: (4) [255, 26, 202, 255] 1: 13
        const log_attributes = getDiscreteLogMetadata(d, log_name)?.objects;
        const logLength = Object.keys(log_attributes).length;

        const attributesObject: { [key: string]: [Color, number] } = {};
        const categorical = true;

        Object.keys(log_attributes).forEach((key) => {
            // get the point from log_attributes
            const point = log_attributes[key][1];
            const categoricalMin = 0;
            const categoricalMax = logLength - 1;

            let rgb;
            if (colorMappingFunction) {
                rgb = colorMappingFunction(
                    point,
                    categorical,
                    categoricalMin,
                    categoricalMax
                );
            } else {
                // if color-map function is not defined
                const arrayOfColors: number[] = getColors(
                    logColor,
                    colorTables,
                    point
                );

                if (!arrayOfColors.length)
                    console.error(`Empty or missed '${logColor}' color table`);
                else {
                    rgb = arrayOfColors;
                }
            }

            if (rgb) {
                if (rgb.length === 3) {
                    attributesObject[key] = [[rgb[0], rgb[1], rgb[2]], point];
                } else {
                    // ? What is the point of this? Why do we offset the index in this case, isn't the fourth value the opacity?
                    // (@anders2303)
                    attributesObject[key] = [[rgb[1], rgb[2], rgb[3]], point];
                }
            }
        });
        log_data.forEach((log_value) => {
            const dl_attrs = Object.entries(attributesObject).find(
                ([, value]) => (value as [Color, number])[1] == log_value
            )?.[1];

            if (dl_attrs) log_color.push(dl_attrs[0]);
            else log_color.push([0, 0, 0, 0]); // use transparent for undefined/null log values
        });
    }

    return log_color;
}

export function getLogPath(
    wells_data: WellFeature[],
    d: LogCurveDataType,
    logrun_name: string,
    trajectory_line_color?: ColorAccessor
): Position[] {
    const well_object = getWellObjectByName(wells_data, d.header.well);
    if (!well_object) return [];

    const well_xyz = getTrajectory(well_object, trajectory_line_color);
    const well_mds = getWellMds(well_object);

    if (
        well_xyz == undefined ||
        well_mds == undefined ||
        well_xyz.length == 0 ||
        well_mds.length == 0
    )
        return [];

    const log_xyz: Position[] = [];
    const log_mds = getLogMd(d, logrun_name);
    log_mds.forEach((md) => {
        const xyz = getPositionByMD(well_xyz, well_mds, md);
        log_xyz.push(xyz);
    });

    return log_xyz;
}

export function getColumn<D>(data: D[][], col: number): D[] {
    const column: D[] = [];
    for (let i = 0; i < data.length; i++) {
        column.push(data[i][col]);
    }
    return column;
}
