import React, { Component } from "react";
import WellLogViewer from "../lib/components/WellLogViewer";

import AceEditor from "react-ace";
import "ace-builds/src-min-noconflict/mode-json";
import "ace-builds/src-min-noconflict/theme-monokai";
import "ace-builds/webpack-resolver";

// Data files from https://jsonwelllogformat.org/viewer
import data0 from "./example-data/L898MUD.json";
import data1 from "./example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json";
import data2 from "./example-data/WLC_PETRO_COMPUTED_OUTPUT_1.json";
import data3 from "./example-data/FM_PRESS_RAW_RUN5_MWD_3.json";
const examples = [data0, data1, data2, data3];

import template0 from "./example-data/welllog_template_1.json";
import template1 from "./example-data/welllog_template_2.json";
const templates = [template0, template1];

class WellLogViewerDemo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            example: 0,
            template: 0,
            text: JSON.stringify(templates[0], null, 2), //"{}"
        };
    }

    getData(example) {
        let data = examples[example];
        return data;
    }

    onFileChange(ev) {
        this.setState({ example: ev.target.id });
    }
    onTemplateChange(ev) {
        this.setState({
            template: ev.target.value,
            text: JSON.stringify(templates[ev.target.value], null, 2),
        });
    }

    onEditorChanged(txt) {
        if (this.state.text != txt) {
            try {
                /*const json =*/ txt && JSON.parse(txt);
                this.setState({ text: txt });
            } catch (error) {
                //alert(error)
                // ignore error, user is editing and not yet correct JSON
            }
        }
    }

    insertFileItem(value) {
        return (
            <span>
                <input
                    type="radio"
                    id={value}
                    checked={this.state.example == value}
                    onChange={this.onFileChange.bind(this)}
                />
                {(parseInt(value) + 1).toString()}
            </span>
        );
    }

    insertTemplateItem(name, value) {
        return (
            <option value={value}>
                {name ? name : "Template " + (parseInt(value) + 1).toString()}
            </option>
        );
    }

    render() {
        return (
            <div>
                <div align="center">
                    Template:
                    <select
                        value={this.state.template}
                        onChange={this.onTemplateChange.bind(this)}
                    >
                        {templates.map((template, i) =>
                            this.insertTemplateItem(template.name, i)
                        )}
                    </select>
                    <span> &nbsp; &nbsp; &nbsp; </span>
                    Data file:{" "}
                    {examples.map((example, i) => this.insertFileItem(i))}
                </div>
                <div style={{ height: "92%", display: "flex" }}>
                    <div style={{ width: "20%", flex: "none" }}>
                        <AceEditor
                            width="100%"
                            height="100%"
                            mode="json"
                            theme="monokai"
                            onChange={this.onEditorChanged.bind(this)}
                            name="WellLogAceEditor"
                            editorProps={{ $blockScrolling: true }}
                            value={this.state.text}
                        />
                    </div>
                    <div style={{ width: "80%", flex: 1 }}>
                        <WellLogViewer
                            id="WellLogViewer"
                            welllog={this.getData(this.state.example)}
                            template={JSON.parse(this.state.text)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default WellLogViewerDemo;
