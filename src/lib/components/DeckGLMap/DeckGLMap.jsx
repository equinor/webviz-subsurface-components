import * as React from "react";
import PropTypes from "prop-types";

import Map from "./Map";

import { applyPatch } from "fast-json-patch";

function DeckGLMap({ id, resources, deckglSpecPatch, coords, setProps }) {
    const [deckglSpec, setDeckglSpec] = React.useState({});

    React.useEffect(() => {
        if (!deckglSpecPatch) {
            return;
        }

        // TODO: clean this crap
        const patch = deckglSpecPatch.map((patch) => {
            patch.path = patch.path.replaceAll(/\[([\w-]+)\]/g, (_, p1) => {
                return deckglSpec.layers.findIndex(({ id }) => {
                    return id == p1;
                });
            });
            return patch;
        });

        const newSpec = applyPatch(deckglSpec, patch, true, false).newDocument;

        // TODO error check

        setDeckglSpec(newSpec);
    }, [deckglSpecPatch]);

    return (
        <Map
            id={id}
            resources={resources}
            deckglSpec={deckglSpec}
            patchSpec={(patch) => {
                setProps({
                    deckglSpecPatch: patch,
                });
            }}
            coords={coords}
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
     * Resource dictionary made available in the DeckGL specification as an enum.
     * The values can be accessed like this: `"@@#resources.resourceId"`, where
     * `resourceId` is the key in the `resources` dict. For more information,
     * see the DeckGL documentation on enums in the json spec: https://deck.gl/docs/api-reference/json/conversion-reference#enumerations-and-using-the--prefix
     */
    resources: PropTypes.object,

    /**
     * TODO: Fix this doc
     * JSON specification of the map to be displayed. More detailes about
     * the format can be found here: https://deck.gl/docs/api-reference/json/conversion-reference
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

    /**
     * For reacting to prop changes
     */
    setProps: PropTypes.func,
};

DeckGLMap.defaultProps = {
    coords: {
        visible: true,
        multiPicking: true,
        pickDepth: 10,
    },
};

export default DeckGLMap;
