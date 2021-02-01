import React from "react";

import DeckGLMap from "../lib/components/DeckGLMap";

import exampleData from "./example-data/deckgl-map.json";

const DeckGLMapDemo = () => {
    const example = exampleData[1];
    return (
        <div style={{ height: "95%" }}>
            <DeckGLMap
                jsonData={example.jsonData}
            />
            <img src={example.colormap} />
        </div>
    );
};

export default DeckGLMapDemo;
