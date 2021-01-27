import React from "react";

import DeckGLMap from "../lib/components/DeckGLMap";

import exampleData from "./example-data/deckgl-map.json";

const DeckGLMapDemo = () => {
    // Viewport settings
    // const INITIAL_VIEW_STATE = {
    //     longitude: -122.43669,
    //     latitude: 37.7253,
    //     zoom: 13,
    //     pitch: 0,
    //     bearing: 0,
    // };
    const INITIAL_VIEW_STATE = {
        target: [0, 0, 0],
        zoom: 3,
    };
    const example = exampleData[1];
    return (
        <div style={{ height: "95%" }}>
            <DeckGLMap
                viewState={INITIAL_VIEW_STATE}
                dataImage={example.dataImage}
                colormap={example.colormap}>
            </DeckGLMap>
            <img src={example.colormap} />
        </div>
    );
};

export default DeckGLMapDemo;
