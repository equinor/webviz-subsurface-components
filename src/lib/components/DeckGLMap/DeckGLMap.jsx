import * as React from "react";
import DeckGL from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import PropTypes from "prop-types";

import ColormapLayer from "./layers/colormapLayer";

function DeckGLMap(props) {
    const colormapLayer = new ColormapLayer({
        id: "bitmap-layer",
        bounds: [-50, 50, 50, -50],
        image: props.dataImage,
        colormap: props.colormap,
        pickable: false,


    });
    const orthoView = new OrthographicView({
        id: "2d-scene",
        controller: true,
    });

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <DeckGL
                initialViewState={props.viewState}
                controller={true}
                views={orthoView}
                layers={[colormapLayer]}
            />
        </div>
    );
}

DeckGLMap.propTypes = {
    dataImage: PropTypes.string,
    colormap: PropTypes.string,
    viewState: PropTypes.object,
};

export default DeckGLMap;
