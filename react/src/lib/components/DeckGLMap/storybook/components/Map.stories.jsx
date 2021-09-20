import React from "react";
import * as jsonpatch from "fast-json-patch";
import Map from "../../components/Map";

const exampleData = require("../../../../../demo/example-data/deckgl-map-spec.json");
export default {
    component: Map,
    title: "DeckGLMap/Components/Map",
};

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

const Template = (args) => {
    let [mapSpec, setMapSpec] = React.useState(null);

    React.useEffect(() => {
        setMapSpec(args.deckglSpec);
    }, [args.deckglSpec]);

    return (
        <Map
            {...args}
            setSpecPatch={(patch) => {
                setMapSpec(_setPatch(mapSpec, patch));
            }}
        />
    );
};

export const Default = Template.bind({});
Default.args = exampleData[0];
