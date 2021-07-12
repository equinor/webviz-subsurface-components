import * as jsonpatch from "fast-json-patch";
import { cloneDeep } from "lodash";
import PropTypes from "prop-types";
import * as React from "react";
import InfoCard from "./components/InfoCard";
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

const _getPatch = (base, modified) => {
    if (typeof modified === "function") {
        const baseClone = cloneDeep(base);
        return jsonpatch.compare(base, modified(baseClone));
    }
    return jsonpatch.compare(base, modified);
};

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

DeckGLMap.defaultProps = {
    coords: {
        visible: true,
        multiPicking: true,
        pickDepth: 10,
    },
};

function DeckGLMap({
    id,
    resources,
    deckglSpecBase,
    deckglSpecPatch,
    coords,
    setProps,
}) {
    let [patchedSpec, setPatchedSpec] = React.useState(null);

    React.useEffect(() => {
        if (!deckglSpecBase) return;

        setPatchedSpec(
            deckglSpecPatch
                ? _setPatch(deckglSpecBase, deckglSpecPatch)
                : deckglSpecBase
        );
    }, [deckglSpecBase, deckglSpecPatch]);

    React.useEffect(() => {
        if (!patchedSpec) return;

        const drawingEnabled = patchedSpec.layers.some((layer) => {
            return layer["@@type"] == "DrawingLayer" && layer["mode"] != "view";
        });

        const patch = _getPatch(patchedSpec, (newSpec) => {
            newSpec.layers.forEach((layer) => {
                if (layer["@@type"] == "WellsLayer") {
                    layer.selectionEnabled = !drawingEnabled;
                }
            });
            return newSpec;
        });

        if (patch.length !== 0) {
            setProps({
                deckglSpecBase: patchedSpec,
                deckglSpecPatch: patch,
            });
        }
    }, [patchedSpec]);

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
    const setSpecPatch = React.useCallback(
        (patch) => {
            setProps({
                deckglSpecBase: patchedSpec,
                deckglSpecPatch: patch,
            });
        },
        [setProps, patchedSpec]
    );

    return (
        patchedSpec && (
            <div
                style={{ height: "100%", width: "100%", position: "relative" }}
            >
                <Map
                    id={id}
                    resources={resources}
                    deckglSpec={patchedSpec}
                    setSpecPatch={setSpecPatch}
                    onHover={onHover}
                >
                    {coords.visible ? <InfoCard pickInfos={hoverInfo} /> : null}
                </Map>
            </div>
        )
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

    /**
     * For reacting to prop changes
     */
    setProps: PropTypes.func,
};

export default DeckGLMap;
