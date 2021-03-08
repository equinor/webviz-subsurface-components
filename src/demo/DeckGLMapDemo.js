import React from "react";

import AceEditor from "react-ace";
import "ace-builds/src-min-noconflict/mode-json";
import "ace-builds/src-min-noconflict/theme-monokai";
import "ace-builds/webpack-resolver";

import PropTypes from "prop-types";
import DeckGLMap from "../lib/components/DeckGLMap";

import ResizePanel from "react-resize-panel";

import exampleData from "./example-data/deckgl-map.json";

// Component used to catch DeckGL errors an display a message.
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch(error, errorInfo) {
        // Logging it just as a warning, since it's expected to happen when
        // actively editing the JSON file.
        console.warn(error, errorInfo);

        this.setState({ hasError: true });
        this.props.onReset();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.reset && this.props.reset && this.state.hasError) {
            this.setState({ hasError: false });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        width: "100%",
                        border: "solid 3px red",
                    }}
                >
                    <h3>Invalid map description</h3>
                </div>
            );
        }
        return this.props.children;
    }
}
ErrorBoundary.propTypes = {
    reset: PropTypes.bool,
    onReset: PropTypes.func,
    children: PropTypes.node.isRequired,
};

function _get_colmaps(layers) {
    return layers
        .filter(l => l["@@type"] == "ColormapLayer")
        .map(v => v["colormap"]);
}

const DeckGLMapDemo = () => {
    const [text, setText] = React.useState("");

    const [jsonData, setJsonData] = React.useState(null);
    const [colormaps, setColormaps] = React.useState([]);

    const [errorReset, setErrorReset] = React.useState(false);

    React.useEffect(() => {
        const example = exampleData[1];

        setText(JSON.stringify(example, null, 2));

        setJsonData(example.jsonData);

        const colmaps = _get_colmaps(example.jsonData["layers"]);
        setColormaps(colmaps);
    }, []);

    const onEditorChanged = React.useCallback(txt => {
        if (txt != text) {
            setText(txt);
            // Parse JSON, while capturing and ignoring exceptions
            try {
                const json = txt && JSON.parse(txt);
                setJsonData(json.jsonData);

                const colmaps = _get_colmaps(json.jsonData["layers"]);
                setColormaps(colmaps);

                setErrorReset(true);
            } catch (error) {
                // ignore error, user is editing and not yet correct JSON
            }
        }
    });

    // TODO: Fold code panel in a slider:
    // https://eds-storybook-react.azurewebsites.net/?path=/docs/components-sidesheet--default
    return (
        <div style={{ height: "95%", display: "flex" }}>
            <ResizePanel direction="e" style={{ width: "30%" }}>
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
                    />
                </div>
            </ResizePanel>
            <div style={{ flex: 2 }}>
                <ErrorBoundary
                    reset={errorReset}
                    onReset={() => {
                        setErrorReset(false);
                    }}
                >
                    <DeckGLMap id="DeckGL-Map" jsonData={jsonData} />
                </ErrorBoundary>
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
