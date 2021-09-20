import React, { Component, ReactNode } from "react";

interface Info {
    name?: string;
    units?: string;
    color: string;
    value: string;
    type: string; // "seperator"; "line", "linestep", "area", "dot"
}

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
        <tr key={info.name}>
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
                {info.value}
            </td>
            <td style={{ paddingLeft: "1em", fontSize: "x-small" }}>
                {info.units}
            </td>
        </tr>
    );
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
