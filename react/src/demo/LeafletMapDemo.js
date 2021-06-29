/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import React, { useState } from "react";

// Components
import LeafletMap from "../lib/components/LeafletMap";

// Assets
import exampleData from "./example-data/leaflet-map.json";

const LeafletMapDemo = () => {
    const [layers, setLayers] = useState(() => exampleData.layers.slice(1, 5));

    const [switchValue, setSwitchValue] = useState(
        layers[0].data[0].shader.applyHillshading
    );

    const onChange = (changes) => {
        const newLayers = Object.assign([], layers);
        if (changes.switch) {
            setSwitchValue(changes.switch.value);
            newLayers[0].action = "update";
            if (changes.switch.value === true) {
                newLayers[0].data[0].shader.applyHillshading = true;
            } else {
                newLayers[0].data[0].shader.applyHillshading = false;
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
