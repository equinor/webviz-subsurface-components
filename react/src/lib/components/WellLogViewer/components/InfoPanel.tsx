import React, { Component, ReactNode } from "react";

interface Info {
    name?: string;
    units?: string;
    color: string;
    value: string;
    type: string; // line, linestep, area, ?dot?
}

interface Props {
    header: string;
    infos: Info[];
}

function createSeparator() {
    return (
        <tr>
            <td colSpan={3}>
                {" "}
                <hr />
            </td>
        </tr>
    );
}

function createRow(info: Info) {
    if (info.type === "separator")
        // special
        return createSeparator();

    return (
        <>
            <tr>
                {/*info.type*/}
                <td>
                    <span style={{ color: info.color }}>{"\u2B24"}</span>&nbsp;
                    {info.name}
                </td>
                <td style={{ paddingLeft: "1em", fontSize: "x-small" }}>
                    {info.units}
                </td>
                <td
                    style={{
                        width: "80px",
                        paddingLeft: "2em",
                        textAlign: "right",
                    }}
                >
                    {info.value}
                </td>
            </tr>
        </>
    );
}

class InfoPanel extends Component<Props> {
    render(): ReactNode {
        return (
            <div>
                <fieldset>
                    <legend>{this.props.header}</legend>
                    <small>{this.props.infos.map(createRow)}</small>
                </fieldset>
            </div>
        );
    }
}

export default InfoPanel;
