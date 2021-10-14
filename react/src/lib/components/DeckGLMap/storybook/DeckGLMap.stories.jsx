import React from "react";
import DeckGLMap from "../DeckGLMap";

const exampleData = require("../../../../demo/example-data/deckgl-map.json");

export default {
    component: DeckGLMap,
    title: "DeckGLMap",
};

const Template = (args) => {
    //const [mapLayers, setMapLayers] = React.useState(null);
    //const [mapSpecPatch, setMapSpecPatch] = React.useState(null);
    /*
    React.useEffect(() => {
        setMapLayers(args.deckglLayers);
    }, [args.deckglLayers]);


    React.useEffect(() => {
        setMapSpecPatch(args.deckglSpecPatch);
    }, [args.deckglSpecPatch]);
    */
    return (
        <DeckGLMap
            {...args}
            //layers={mapLayers}
            //deckglSpecBase={mapSpecBase}
            //deckglSpecPatch={mapSpecPatch}
            //setProps={(updatedSpec) => {
            //    setMapLayers(updatedSpec.deckglLayers);
            //    setMapSpecPatch(updatedSpec.deckglSpecPatch);
            //}}
        />
    );
};

export const Default = Template.bind({});
Default.args = exampleData[0];
