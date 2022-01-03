import React, { Component, ReactNode } from "react";

import { Info } from "./InfoTypes";

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

function formatValue(v1: number) {
    if (!Number.isFinite(v1)) return "";
    let v = v1.toPrecision(4);
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

    onRowClick(
        trackId: string | number /*,
        ev: React.MouseEvent<HTMLTableRowElement>*/
    ): void {
        if (!this.props.onGroupClick) return;
        this.props.onGroupClick(trackId);
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

        return (
            <tr key={info.trackId + "." + info.name}>
                {/* Set key prop just for react pleasure. See https://reactjs.org/link/warning-keys for more information */}
                {/*info.type*/}
                <td style={{ color: info.color, fontSize: "small" }}>
                    {"\u2B24" /*big circle*/}
                </td>
                <td>{info.name}</td>
                <td
                    style={{
                        width: "90px",
                        paddingLeft: "1.5em",
                        textAlign: "right",
                    }}
                >
                    {formatValue(info.value)}
                </td>
                <td style={{ paddingLeft: "0.5em" }}>{info.units}</td>
            </tr>
        );
    }

    render(): ReactNode {
        return (
            <div style={{ overflowY: "auto", overflowX: "hidden" }}>
                <fieldset>
                    <legend>{this.props.header}</legend>

                    <table
                        style={{
                            borderSpacing: "0px",
                        }}
                    >
                        <tbody>
                            {this.props.infos.map(this.createRow.bind(this))}
                        </tbody>
                    </table>
                </fieldset>
            </div>
        );
    }
}

export default InfoPanel;
