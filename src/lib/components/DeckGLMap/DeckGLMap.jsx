import * as React from "react";
import DeckGL from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import PropTypes from "prop-types";

import ColormapLayer from "./layers/colormapLayer";

function DeckGLMap(props) {
    // VIEWS
    const [viewStates, setViewStates] = React.useState(props.viewState);

    const onViewStateChange = React.useCallback(({ viewState }) => {
        setViewStates(viewState);
    }, []);

    const orthoView_left = new OrthographicView({
        id: "ortho_left",
        controller: true,
        x: "0%",
        y: "0%",
        width: "50%",
        height: "100%",
    });
    const orthoView_right = new OrthographicView({
        id: "ortho_right",
        controller: true,
        x: "50%",
        y: "0%",
        width: "50%",
        height: "100%",
    });

    // LAYERS
    const colormapLayer = new ColormapLayer({
        id: "bitmap-layer",
        bounds: [-50, 50, 50, -50],
        image: props.dataImage,
        colormap: props.colormap,
    });

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <DeckGL
                controller={true}
                views={[orthoView_left, orthoView_right]}
                layers={[colormapLayer]}
                viewState={viewStates}
                onViewStateChange={onViewStateChange}
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
