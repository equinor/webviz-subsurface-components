import * as React from "react";

import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";
import PropTypes from "prop-types";

import JSON_CONVERTER_CONFIGURATION from "./configuration";

function DeckGLMap(props) {
    const [jsonProps, setJsonProps] = React.useState(null);
    React.useEffect(() => {
        const configuration = new JSONConfiguration(
            JSON_CONVERTER_CONFIGURATION
        );
        const jsonConverter = new JSONConverter({ configuration });

        setJsonProps(jsonConverter.convert(props.jsonData));
    }, [props.jsonData]);

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            {jsonProps && <DeckGL id={props.id} {...jsonProps} />}
        </div>
    );
}

DeckGLMap.propTypes = {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,

    /**
     * JSON description of the map to be displayed. More detailes about
     * the format can be found here: https://deck.gl/docs/api-reference/json/conversion-reference
     */
    jsonData: PropTypes.object,
};

export default DeckGLMap;
