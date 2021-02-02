import * as React from "react";
import DeckGL from "@deck.gl/react";
import { JSONConverter, JSONConfiguration } from "@deck.gl/json";

import PropTypes from "prop-types";

import JSON_CONVERTER_CONFIGURATION from "./configuration";

function DeckGLMap(props) {
    const configuration = new JSONConfiguration(JSON_CONVERTER_CONFIGURATION);
    const jsonConverter = new JSONConverter({ configuration });

    const [jsonProps, setJsonProps] = React.useState(null);
    React.useEffect(() => {
        setJsonProps(jsonConverter.convert(props.jsonData));
    }, [props.jsonData]);

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <DeckGL id="serialized-deck" {...jsonProps} />
        </div>
    );
}

DeckGLMap.propTypes = {
    jsonData: PropTypes.object,
};

export default DeckGLMap;
