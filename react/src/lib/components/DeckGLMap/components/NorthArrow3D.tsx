import DeckGL from "@deck.gl/react";
import React from "react";
import { ScenegraphLayer } from "@deck.gl/mesh-layers";
import { COORDINATE_SYSTEM } from "deck.gl";
import { OrbitView } from "@deck.gl/core";
import { load } from "@loaders.gl/core";
import { GLTFLoader } from "@loaders.gl/gltf";

const GLTF_MODEL = "https://raw.githubusercontent.com/equinor/webviz-subsurface-components/master/react/src/demo/example-data/gltf/scene.gltf!;

interface NorthArrow3DProps {
    rotationOrbit: number;
    rotationX: number;
    position?: number[] | null;
}

const view = new OrbitView({
    id: "main",
    controller: false,
    x: "0%",
    y: "0%",
    width: "100%",
    height: "100%",
});

const INITIAL_VIEW_STATE = {
    target: [0.0, 0.0],
    zoom: 0,
};

const layers = [
    new ScenegraphLayer({
        id: "north-arrow-scenegraph-layer",
        data: [{}],
        scenegraph: load("arrow.gltf", GLTFLoader, {}),
        getOrientation: [0.0, 0.0, 0.0],
        getTranslation: [0.0, 0.0, 0.0],
        getScale: [1, 1, 1],
        sizeScale: 200,
        _lighting: "pbr",
        pickable: false,
        coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    }),
];

const NorthArrow3D: React.FC<NorthArrow3DProps> = ({
    rotationOrbit,
    rotationX,
    position,
}: NorthArrow3DProps) => {
    const view_state = {
        rotationOrbit: rotationOrbit + 90.0,
        rotationX,
        target: [0.0, 0.0],
        zoom: 0,
    };

    return (
        <DeckGL
            style={{
                left: position?.[0] ?? 25,
                top: position?.[1] ?? 25,
                width: 100,
                height: 100,
                position: "relative",
                // keep!  backgroundColor: "red",
            }}
            layers={layers}
            initialViewState={INITIAL_VIEW_STATE}
            viewState={view_state}
            views={[view]}
            controller={false}
        ></DeckGL>
    );
};

NorthArrow3D.defaultProps = {
    rotationOrbit: 0.0,
    rotationX: 0.0,
    position: [25, 25],
};

export default NorthArrow3D;
