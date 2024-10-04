import type { ReactNode } from "react";
import React, { Component } from "react";

import type { Info } from "./InfoTypes";

interface Props {
    header?: string | JSX.Element;
    infos: Info[];
    onGroupClick?: (info: Info) => void;
}

function createSeparator(info: Info): JSX.Element {
    return (
        <tr key={"_separator_" + info.trackId + "." + info.name}>
            {/* Set key prop just for react pleasure. See https://reactjs.org/link/warning-keys for more information */}
            <td colSpan={4}>
                {" "}
                <hr />
            </td>
        </tr>
    );
}

function formatValue(value: number): string {
    if (!Number.isFinite(value)) return "";
    if (Number.isInteger(value)) return value.toFixed(0);
    let v = value.toPrecision(4);
    if (v.indexOf(".") >= 0) {
        // cut trailing zeroes
        for (;;) {
            let l = v.length;
            if (!l--) break;
            if (v[l] !== "0") break;
            v = v.substring(0, l);
        }
    }
    return v;
}

const bigCircle = "\u2B24";
const nbsp = "\xA0";
const ellipsis = "\u2026"; //"…";
class InfoPanel extends Component<Props> {
    constructor(props: Props) {
        super(props);
        this.createRow = this.createRow.bind(this);
    }

    onRowClick(
        info: Info /*,
        ev: React.MouseEvent<HTMLTableRowElement>*/
    ): void {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        this.props.onGroupClick?.(info);
    }

    createGroupRow(info: Info): ReactNode {
        return (
            <tr
                className="group-row"
                key={"_group_" + info.trackId + "." + info.name}
                onClick={() => this.onRowClick(info)}
            >
                <td style={{ color: info.color }}>
                    {
                        info.collapsed
                            ? "\u25BA"
                            : "\u25BC" /*right/down-pointing triangle*/
                    }
                </td>
                <td colSpan={3} className="group-row-name">
                    {info.name}
                </td>
            </tr>
        );
    }

    createRow(info: Info): ReactNode {
        const autoDescreaseFontSize = false;
        if (info.type === "separator")
            // special case
            return createSeparator(info);

        if (info.groupStart !== undefined) return this.createGroupRow(info);

        let name = info.name || "?";
        const tooltip = name;
        // print long names and values with a smaller font size
        const styleInfoName: React.CSSProperties = {};
        let maxLen = 11;
        if (autoDescreaseFontSize && name.length > 10) {
            styleInfoName.fontSize = "x-small";
            maxLen = 16;
        }
        if (name.length > maxLen) {
            // compress too long names
            name = name.substring(0, maxLen - 2) + ellipsis;
        }

        let value = formatValue(info.value);
        if (info.discrete)
            value = info.discrete + (value ? nbsp + "(" + value + ")" : "");
        if (value === "") value = nbsp; // set some text to force an empty line to have the same height as non-empty line
        const styleInfoValue: React.CSSProperties = {};
        if (autoDescreaseFontSize && value.length > 10)
            styleInfoValue.fontSize = "x-small";
        /// style={styleInfoName} title={tooltip!==name? tooltip: undefined}>{name}
        return (
            <tr key={info.trackId + "." + info.name}>
                <td className="row-info" style={{ color: info.color }}>
                    {bigCircle}
                </td>
                <td className="row-name" title={tooltip}></td>
                <td
                    className="row-value"
                    colSpan={info.discrete ? 2 : 1}
                    title={value}
                ></td>
                {!info.discrete && (
                    <td className="row-units" title={info.units}></td>
                )}
            </tr>
        );
    }

    render(): JSX.Element {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line react/prop-types
        const header = this.props.header;
        return (
            <div className="readout">
                <fieldset>
                    {header && <legend>{header}</legend>}
                    <table>
                        <tbody>
                            {/* TODO: Fix this the next time the file is edited. */}
                            {/* eslint-disable-next-line react/prop-types */}
                            {this.props.infos?.map(this.createRow.bind(this))}
                        </tbody>
                    </table>
                </fieldset>
            </div>
        );
    }
}

export default InfoPanel;
