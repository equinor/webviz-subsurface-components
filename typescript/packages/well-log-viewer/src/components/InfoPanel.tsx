import type { ReactNode } from "react";
import React, { Component } from "react";
import { Tooltip } from "@mui/material";

import type { Info } from "./InfoTypes";

interface Props {
    header: string;
    infos: Info[];
    onGroupClick?: (trackId: string | number) => void;
}

function createSeparator() {
    return (
        <tr key={"separator"}>
            {/* Set key prop just for react pleasure. See https://reactjs.org/link/warning-keys for more information */}
            <td colSpan={4}>
                {" "}
                <hr />
            </td>
        </tr>
    );
}

const styleGroupRow = {
    backgroundColor: "#ededed",
    cursor: "pointer",
};

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
        trackId: string | number /*,
        ev: React.MouseEvent<HTMLTableRowElement>*/
    ): void {
        if (!this.props.onGroupClick) return;
        this.props.onGroupClick(trackId);
    }

    createRow(info: Info): ReactNode {
        const autoDescreaseFontSize = false;
        if (info.type === "separator")
            // special case
            return createSeparator();

        if (info.groupStart !== undefined) {
            return (
                <tr
                    style={styleGroupRow}
                    key={"_group_" + info.trackId + "." + info.name}
                    onClick={this.onRowClick.bind(this, info.trackId)}
                >
                    <td style={{ color: info.color, fontSize: "small" }}>
                        {
                            info.collapsed
                                ? "\u25BA"
                                : "\u25BC" /*right/down-pointing triangle*/
                        }
                    </td>
                    <td
                        colSpan={3}
                        style={{ fontSize: "small", fontWeight: "bold" }}
                    >
                        {info.name}
                    </td>
                </tr>
            );
        }

        const typeStyle: React.CSSProperties = {
            color: info.color,
            fontSize: "small",
        };
        let name = info.name ? info.name : "?";
        let tooltip = name;
        // print long names and values with a smaller font size
        const nameStyle: React.CSSProperties = { whiteSpace: "nowrap" };
        let maxLen = 11;   
        if (autoDescreaseFontSize && name.length > 10) {
            nameStyle.fontSize = "x-small";
            maxLen= 16;
        }
        if (name.length > maxLen) {
            // compress too long names
            name = name.substring(0, maxLen-2) + ellipsis;
        }

        let value = formatValue(info.value);
        if (info.discrete)
            value = info.discrete + (value ? nbsp + "(" + value + ")" : "");
        if (value === "") value = nbsp; // set some text to force the empty line to have the same height as non-empty line
        const valueStyle: React.CSSProperties = {
            width: "90px",
            maxWidth: "90px",
            paddingLeft: "1.5em",
            textAlign: "right",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden"
        };
        if (value.length > 10) valueStyle.fontSize = "x-small";
        return (
            <tr
                key={
                    info.trackId +
                    "." +
                    info.name /*Set unique key prop just for react pleasure*/
                }
            >
                <td style={typeStyle}>{bigCircle}</td>
                <td style={nameStyle}>
                   {name!==tooltip? 
                    <Tooltip title={tooltip}>{name}</Tooltip>: 
                    name}
                </td>
                <td style={valueStyle} colSpan={info.discrete ? 2 : 1}>
                    {value}
                </td>
                {!info.discrete ? (
                    <td style={{ paddingLeft: "0.5em" }}>{info.units}</td>
                ) : null}
            </tr>
        );
    }

    render(): JSX.Element {
        return (
            <div styleName="readout" style={{ overflowY: "auto", overflowX: "hidden" }}>
                <fieldset>
                    <legend>{this.props.header}</legend>

                    <table
                        style={{
                            borderSpacing: "0px",
                            width: "100%",
                        }}
                    >
                        <tbody>
                            {this.props.infos?.map(this.createRow.bind(this))}
                        </tbody>
                    </table>
                </fieldset>
            </div>
        );
    }
}

export default InfoPanel;
