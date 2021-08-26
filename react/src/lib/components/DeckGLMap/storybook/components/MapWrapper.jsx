import * as jsonpatch from "fast-json-patch";
import PropTypes from "prop-types";
import * as React from "react";
import Map from "../../components/Map";

function _idsToIndices(doc, path) {
    // The path looks something like this: `/layers/[layer-id]/property`,
    // where `[layer-id]` is the id of an object in the `layers` array.
    // This function will replace all object ids with their indices in the array,
    // resulting in a path that would look like this: `/layers/2/property`,
    // which is a valid json pointer that can be used by json patch.

    const replaced = path.replace(
        /([\w-/]*)\/\[([\w-]+)\]/,
        (_, parent, matchedId) => {
            const parentArray = jsonpatch.getValueByPointer(doc, parent);
            const index = parentArray.findIndex(({ id }) => {
                return matchedId == id;
            });
            if (index < 0) throw `Id [${matchedId}] not found!`;
            return `${parent}/${index}`;
        }
    );

    // Replace all ids in the path.
    if (path != replaced) {
        return _idsToIndices(doc, replaced);
    }
    return path;
}

const _setPatch = (base, patch) => {
    let result = base;
    try {
        const normalizedPatch = patch.map((patch) => {
            return {
                ...patch,
                path: _idsToIndices(base, patch.path),
            };
        });
        result = jsonpatch.applyPatch(
            base,
            normalizedPatch,
            true,
            false
        ).newDocument;
    } catch (error) {
        console.error("Unable to apply patch: " + error);
    }
    return result;
};

MapWrapper.defaultProps = {
    coords: {
        visible: true,
        multiPicking: true,
        pickDepth: 10,
    },
};

function MapWrapper({ id, resources, deckglSpec, coords }) {
    let [mapSpec, setMapSpec] = React.useState(null);

    React.useEffect(() => {
        setMapSpec(deckglSpec);
    }, [deckglSpec]);

    return (
        <Map
            id={id}
            resources={resources}
            coords={coords}
            deckglSpec={mapSpec}
            setSpecPatch={(patch) => {
                setMapSpec(_setPatch(mapSpec, patch));
            }}
        />
    );
}

MapWrapper.propTypes = {
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
     * JSON object describing the map specification.
     * More detailes about the specification format can be found here:
     * https://deck.gl/docs/api-reference/json/conversion-reference
     */
    deckglSpec: PropTypes.object,

    /**
     * Parameters for the coordinates component
     */
    coords: PropTypes.shape({
        visible: PropTypes.bool,
        multiPicking: PropTypes.bool,
        pickDepth: PropTypes.number,
    }),
};

export default MapWrapper;
