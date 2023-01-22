import React, { Component, ReactNode } from "react";

import { Info } from "./InfoTypes";

interface Props {
    header?: string;
    infos: Info[];
    onGroupClick?: (info: Info) => void;
}

function createSeparator() {
    return (
        <tr key={"separator"}>
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

class InfoPanel extends Component<Props> {
    constructor(props: Props) {
        super(props);
        this.createRow = this.createRow.bind(this);
    }

    onRowClick(info: Info): void {
        this.props.onGroupClick?.(info);
    }

    createRow(info: Info): ReactNode {
        if (info.type === "separator")
            // special case
            return createSeparator();

        if (info.groupStart !== undefined) {
            return (
                <tr
                    style={styleGroupRow}
                    key={"_group_" + info.trackId + "." + info.name}
                    onClick={this.onRowClick.bind(this, info)}
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

        let name = info.name ? info.name : "?";
        if (name.length > 15)
            // compress too long names
            name = name.substring(0, 13) + "…";
        // print long names and values with a smaller font size
        const nameStyle: React.CSSProperties =
            name.length > 10 ? { fontSize: "x-small" } : {};
        let value = formatValue(info.value);
        if (info.discrete)
            value = info.discrete + (value ? "\xA0(" + value + ")" : "");
        const valueStyle: React.CSSProperties = {
            width: "90px",
            paddingLeft: "1.5em",
            textAlign: "right",
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
                {/*info.type*/}
                <td style={{ color: info.color, fontSize: "small" }}>
                    {"\u2B24" /*big circle*/}
                </td>
                <td style={nameStyle}>{name}</td>
                <td style={valueStyle}>{value}</td>
                <td style={{ paddingLeft: "0.5em" }}>{info.units}</td>
            </tr>
        );
    }

    render(): JSX.Element {
        return (
            <div style={{ overflowY: "auto", overflowX: "hidden" }}>
                <fieldset>
                    {this.props.header && <legend>{this.props.header}</legend>}

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
