import React, { useState } from "react";

// Components
import LeafletMap from "../lib/components/LeafletMap";

// Assets
import exampleData from "./example-data/leaflet-map.json";

const DEFAULT_COLORMAP = {
    colors: [
        "#0d0887",
        "#46039f",
        "#7201a8",
        "#9c179e",
        "#bd3786",
        "#d8576b",
        "#ed7953",
        "#fb9f3a",
        "#fdca26",
        "#f0f921",
    ],
    prefixZeroAlpha: false,
    scaleType: "linear",
    cutPointMin: 3400,
    cutPointMax: 3500,
};

const LeafletMapDemo = () => {
    const [switchValue, setSwitchValue] = useState(true);
    const [layers, setLayers] = useState(exampleData.layers.slice(1, 5));

    const onChange = changes => {
        const newLayers = Object.assign([], layers);
        if (changes.switch) {
            setSwitchValue(changes.switch.value);
            newLayers[0].action = "update";
            if (changes.switch.value === true) {
                newLayers[0].data[0].shader.type = "hillshading";
                newLayers[0].data[0].shader.shadows = true;
                newLayers[0].data[0].colorScale = DEFAULT_COLORMAP;
                newLayers[0].data[0].colorScale.cutPointMin = 2700;
                newLayers[0].data[0].colorScale.cutPointMax = 3500;
            } else {
                newLayers[0].data[0].shader.type = null;
                newLayers[0].data[0].colorScale = {
                    cutPointMin: 2700,
                    cutPointMax: 3500,
                };
            }
            setLayers(newLayers);
        }
    };

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                height: "90vh",
            }}
        >
            <div>
                <LeafletMap
                    id={"LeafletMap-3"}
                    syncedMaps={["LeafletMap-4"]}
                    // syncDrawings={true}
                    layers={layers}
                    unitScale={{
                        position: "bottomright",
                    }}
                    colorBar={{
                        position: "bottomleft",
                    }}
                    crs="simple"
                    minZoom={-5}
                    zoom={-5}
                    mouseCoords={{
                        position: "bottomleft",
                    }}
                    drawTools={{
                        drawMarker: true,
                        drawPolygon: true,
                        drawPolyline: true,
                        position: "topright",
                    }}
                    switch={{
                        value: switchValue,
                        label: "Hillshading",
                        position: "bottomleft",
                    }}
                    setProps={onChange}
                />
            </div>
            <div>
                <LeafletMap
                    id={"LeafletMap-4"}
                    syncedMaps={["LeafletMap-3"]}
                    syncDrawings={true}
                    layers={layers}
                    colorBar={{
                        position: "bottomleft",
                    }}
                    crs="simple"
                    minZoom={-5}
                    zoom={-5}
                    mouseCoords={{
                        position: "bottomleft",
                    }}
                    drawTools={{
                        drawMarker: true,
                        drawPolygon: true,
                        drawPolyline: true,
                        position: "topright",
                    }}
                    switch={{
                        value: switchValue,
                        label: "Hillshading",
                        position: "bottomleft",
                    }}
                    setProps={onChange}
                />
            </div>
        </div>
    );
};

export default LeafletMapDemo;
