import * as jsonpatch from "fast-json-patch";
import { cloneDeep } from "lodash";
import PropTypes from "prop-types";
import * as React from "react";
import Coords from "./components/Coords";
import Map from "./Map";

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

DeckGLMap.defaultProps = {
    coords: {
        visible: true,
        multiPicking: true,
        pickDepth: 10,
    },
};

function DeckGLMap({ id, resources, deckglSpecPatch, coords, setProps }) {
    const [deckglSpec, setDeckglSpec] = React.useState(null);
    React.useEffect(() => {
        if (!deckglSpecPatch) {
            return;
        }

        let newSpec = deckglSpec;
        try {
            const patch = deckglSpecPatch.map((patch) => {
                return {
                    ...patch,
                    path: _idsToIndices(deckglSpec, patch.path),
                };
            });
            newSpec = jsonpatch.applyPatch(
                deckglSpec,
                patch,
                true,
                false
            ).newDocument;
        } catch (error) {
            console.error("Unable to apply patch: " + error);
        }

        setDeckglSpec(newSpec);
    }, [deckglSpecPatch]);

    React.useEffect(() => {
        if (!deckglSpec) return;

        const drawingEnabled = deckglSpec.layers.some((layer) => {
            return layer["@@type"] == "DrawingLayer" && layer["mode"] != "view";
        });

        const newSpec = cloneDeep(deckglSpec);
        newSpec.layers.forEach((layer) => {
            if (layer["@@type"] == "WellsLayer") {
                layer.selectionEnabled = !drawingEnabled;
            }
        });

        const patch = jsonpatch.compare(deckglSpec, newSpec);
        if (patch.length !== 0) {
            setProps({
                deckglSpecPatch: patch,
            });
        }
    }, [deckglSpec]);

    const [hoverInfo, setHoverInfo] = React.useState([]);
    const onHover = React.useCallback(
        (pickInfo, event) => {
            if (coords.multiPicking && pickInfo.layer) {
                const infos = pickInfo.layer.context.deck.pickMultipleObjects({
                    x: event.offsetCenter.x,
                    y: event.offsetCenter.y,
                    radius: 1,
                    depth: coords.pickDepth,
                });
                setHoverInfo(infos);
            } else {
                setHoverInfo([pickInfo]);
            }
        },
        [coords]
    );
    const patchSpec = React.useCallback(
        (patch) =>
            setProps({
                deckglSpecPatch: patch,
            }),
        [setProps]
    );

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <Map
                id={id}
                resources={resources}
                deckglSpec={deckglSpec}
                patchSpec={patchSpec}
                onHover={onHover}
            >
                <Coords pickInfos={hoverInfo} />
            </Map>
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
     * Resource dictionary made available in the DeckGL specification as an enum.
     * The values can be accessed like this: `"@@#resources.resourceId"`, where
     * `resourceId` is the key in the `resources` dict. For more information,
     * see the DeckGL documentation on enums in the json spec: https://deck.gl/docs/api-reference/json/conversion-reference#enumerations-and-using-the--prefix
     */
    resources: PropTypes.object,

    /**
     * A JSON patch (http://jsonpatch.com/) applied to the DeckGL specification state. The initial state is an empty object.
     * More detailes about the specification format can be found here: https://deck.gl/docs/api-reference/json/conversion-reference
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

export default DeckGLMap;
