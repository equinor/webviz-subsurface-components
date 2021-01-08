import * as React from "react";
import DeckGL from "@deck.gl/react";
import { TerrainLayer } from "@deck.gl/geo-layers";

type DeckGLMapProps = {
    viewState: DeckGL.InitialViewStateProps;
    elevationData: string;
};

function DeckGLMap(props: DeckGLMapProps): React.ReactNode {
    const layer = new TerrainLayer({
        elevationDecoder: {
            rScaler: 10,
            gScaler: 0,
            bScaler: 0,
            offset: 0,
        },
        // Digital elevation model from https://www.usgs.gov/
        elevationData: props.elevationData,
        // texture: props.elevationData,
        bounds: [-122.5233, 37.6493, -122.3566, 37.8159],
    });

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <DeckGL
                initialViewState={props.viewState}
                controller={true}
                layers={[layer]}
            />
        </div>
    );
}
export default DeckGLMap;
