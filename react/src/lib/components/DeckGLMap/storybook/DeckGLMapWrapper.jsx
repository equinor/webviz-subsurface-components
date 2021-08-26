import React from "react";
import PropTypes from "prop-types";
import DeckGLMap from "../DeckGLMap";

const DeckGLMapWrapper = ({
    id,
    resources,
    deckglSpecBase,
    deckglSpecPatch,
    coords,
}) => {
    const [mapSpecBase, setMapSpecBase] = React.useState(null);
    const [mapSpecPatch, setMapSpecPatch] = React.useState(null);

    React.useEffect(() => {
        setMapSpecBase(deckglSpecBase);
    }, [deckglSpecBase]);

    React.useEffect(() => {
        setMapSpecPatch(deckglSpecPatch);
    }, [deckglSpecPatch]);

    return (
        <DeckGLMap
            id={id}
            resources={resources}
            coords={coords}
            deckglSpecBase={mapSpecBase}
            deckglSpecPatch={mapSpecPatch}
            setProps={(updatedSpec) => {
                setMapSpecBase(updatedSpec.deckglSpecBase);
                setMapSpecPatch(updatedSpec.deckglSpecPatch);
            }}
        />
    );
};

DeckGLMapWrapper.propTypes = {
    /**
     * The ID of this component, used to identify dash components
     * in callbacks. The ID needs to be unique across all of the
     * components in an app.
     */
    id: PropTypes.string.isRequired,

    /**
     * Resource dictionary made available in the DeckGL specification as an enum.
     * The values can be accessed like this: `"@@#resources.resourceId"`, where
     * `resourceId` is the key in the `resources` dict. For more information,
     * see the DeckGL documentation on enums in the json spec:
     * https://deck.gl/docs/api-reference/json/conversion-reference#enumerations-and-using-the--prefix
     */
    resources: PropTypes.object,

    /**
     * JSON object describing the map structure to which deckglSpecPatch will be
     * applied in order to form the final map specification.
     * More detailes about the specification format can be found here:
     * https://deck.gl/docs/api-reference/json/conversion-reference
     */
    deckglSpecBase: PropTypes.object,

    /**
     * A JSON patch (http://jsonpatch.com/) applied to deckglSpecBase.
     * This split (base + patch) allows doing partial updates to the map
     * while keeping the map state in the Dash store, as well as
     * making it easier for the Dash component user to figure out what changed
     * in the map spec when recieving a callback on the python side.
     */
    deckglSpecPatch: PropTypes.arrayOf(PropTypes.object),

    /**
     * Parameters for the coordinates component
     */
    coords: PropTypes.shape({
        visible: PropTypes.bool,
        multiPicking: PropTypes.bool,
        pickDepth: PropTypes.number,
    }),
};

export default DeckGLMapWrapper;
