import React from "react";

import AceEditor from "react-ace";

import "ace-builds/src-min-noconflict/mode-json";
import "ace-builds/src-min-noconflict/theme-monokai";

import DeckGLMap from "../lib/components/DeckGLMap";

import exampleData from "./example-data/deckgl-map.json";

function _get_colmaps(layers) {
    return layers
        .filter(l => l["@@type"] == "ColormapLayer")
        .map(v => v["colormap"]);
}

const DeckGLMapDemo = () => {
    const [text, setText] = React.useState("");

    const [jsonData, setJsonData] = React.useState(null);
    const [colormaps, setColormaps] = React.useState([]);

    React.useEffect(() => {
        const example = exampleData[1];

        setText(JSON.stringify(example, null, 2));

        setJsonData(example.jsonData);

        const colmaps = _get_colmaps(example.jsonData["layers"]);
        setColormaps(colmaps);
    }, []);

    const onEditorChanged = txt => {
        setText(txt);
        // Parse JSON, while capturing and ignoring exceptions
        try {
            const json = txt && JSON.parse(txt);
            setJsonData(json.jsonData);

            const colmaps = _get_colmaps(json.jsonData["layers"]);
            setColormaps(colmaps);
        } catch (error) {
            // ignore error, user is editing and not yet correct JSON
        }
    };

    // TODO: Fold code panel in a slider:
    // https://eds-storybook-react.azurewebsites.net/?path=/docs/components-sidesheet--default
    return (
        <div style={{ height: "95%", display: "flex" }}>
            <div style={{ flex: 1 }}>
                <AceEditor
                    width="100%"
                    height="100%"
                    mode="json"
                    theme="monokai"
                    onChange={onEditorChanged}
                    name="AceEditorDiv"
                    editorProps={{ $blockScrolling: true }}
                    value={text}
                    setOptions={{ useWorker: false }}
                />
            </div>
            <div style={{ flex: 2 }}>
                <DeckGLMap jsonData={jsonData} />
                <div>
                    {colormaps.map((colormap, index) => (
                        <img
                            key={index}
                            src={colormap}
                            style={{ padding: "2px" }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeckGLMapDemo;
