import React, { Component, ReactNode } from "react";

import { Info } from "./InfoTypes";

interface Props {
    header: string;
    infos: Info[];
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

function createRow(info: Info) {
    if (info.type === "separator")
        // special case
        return createSeparator();

    return (
        <tr key={info.track_id + "." + info.name}>
            {/* Set key prop just for react pleasure. See https://reactjs.org/link/warning-keys for more information */}
            {/*info.type*/}
            <td style={{ color: info.color }}>{"\u2B24" /*big circle*/}</td>
            <td>{info.name}</td>
            <td
                style={{
                    width: "80px",
                    paddingLeft: "2em",
                    textAlign: "right",
                }}
            >
                {formatValue(info.value)}
            </td>
            <td style={{ paddingLeft: "1em", fontSize: "x-small" }}>
                {info.units}
            </td>
        </tr>
    );
}

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
    render(): ReactNode {
        return (
            <div>
                <fieldset>
                    <legend>{this.props.header}</legend>
                    <small>
                        <table>
                            <tbody>{this.props.infos.map(createRow)}</tbody>
                        </table>
                    </small>
                </fieldset>
            </div>
        );
    }
}

export default InfoPanel;
