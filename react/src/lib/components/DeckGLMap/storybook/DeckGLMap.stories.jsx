import React from "react";
import DeckGLMap from "../DeckGLMap";

const exampleData = require("../../../../demo/example-data/deckgl-map.json");
const colorTemplate = require("../../../../demo/example-data/wellayer_template.json");
const colorTables = require("../../../../demo/example-data/color-tables.json");

export default {
    component: DeckGLMap,
    title: "DeckGLMap",
};

const Template = (args) => {
    const [mapSpecBase, setMapSpecBase] = React.useState(null);
    const [mapSpecPatch, setMapSpecPatch] = React.useState(null);

    React.useEffect(() => {
        setMapSpecBase(args.deckglSpecBase);
    }, [args.deckglSpecBase]);

    React.useEffect(() => {
        setMapSpecPatch(args.deckglSpecPatch);
    }, [args.deckglSpecPatch]);

    return (
        <DeckGLMap
            {...args}
            deckglSpecBase={mapSpecBase}
            deckglSpecPatch={mapSpecPatch}
            setProps={(updatedSpec) => {
                setMapSpecBase(updatedSpec.deckglSpecBase);
                setMapSpecPatch(updatedSpec.deckglSpecPatch);
            }}
            colorTemplate={colorTemplate}
            colorTables={colorTables}
        />
    );
};

export const Default = Template.bind({});
Default.args = exampleData[0];

export const templateData = Template.bind({});
templateData.args = { template: colorTemplate, colorTables: colorTables };
