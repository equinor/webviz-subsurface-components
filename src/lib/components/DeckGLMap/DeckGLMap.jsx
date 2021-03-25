import * as React from "react";
import PropTypes from "prop-types";

import Map from "./Map";

function DeckGLMap(props) {
    return (
        <Map
            id={props.id}
            jsonData={props.jsonData}
            showCoords={props.showCoords}
        />
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

    /**
     * Show or hide the coordinates component. True by default.
     */
    showCoords: PropTypes.bool,
};

DeckGLMap.defaultProps = {
    showCoords: true,
};

export default DeckGLMap;
