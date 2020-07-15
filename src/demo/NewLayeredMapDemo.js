import React, { useState } from 'react';

// Components
import NewLayeredMap from '../lib/components/NewLayeredMap';

// Assets
import exampleData from './example-data/new-layered-map.json';
import { NewLayeredMap } from '../lib/index';

const NewLayeredMapDemo = () => {

    const [switchValue, setSwitchValue] = useState(true);

    const layers = exampleData.layers.slice(1)

    const onChange = (changes) => {
        if(changes.switch) {
            setSwitchValue(changes.switch.value);
            if (changes.switch.value == true) {
                layers[0].data[0].shader.type = 'hillshading';
            } else {
                layers[0].data[0].shader.type = null;
            }
        }
    }

    // const colorArr = ["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"];
    // const colorArr2 = ["#09c12c", "#0b66bc", "#4e9ba3", "#73031b", "#428a67", "#0381a2", "#ece210", "#fb9f3a", "#fdca26", "#f0f921"];

    // const onChange = (changes) => {
    //     if(changes.switch) {
    //         setSwitchValue(changes.switch.value);
    //         if (changes.switch.value == true) {
    //             layers[0].data[0].colorScale.colors = colorArr;
    //         } else {
    //             layers[0].data[0].colorScale.colors = colorArr2;
    //         }
    //     }
    // }

    const layer2 = JSON.parse(JSON.stringify(layers));
    layer2[0].data[0].shader.type = 'none';
    layer2[0].data[0].colorScale.prefixZeroAlpha = true;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto" }}>
            <div >
                <NewLayeredMap 
                    id={"NewLayeredMap-1"}
                    syncedMaps={["NewLayeredMap-2", "NewLayeredMap-3"]}
                    syncDrawings={true}
                    // layers={exampleData.layers}
                    layers={layers}
                    // center={[0, 0]}
                    center={[432205, 6475078], [432205, 6475078]} 
                    bounds={[[432205, 6475078], [437720, 6481113]] [[432205, 6475078], [437720, 6481113]]}
                    crs="simple"
                    //crs="earth"
                    //minZoom={-5}
                    //zoom = {-5} 
                    // setProps={e => console.log(e)}

                    minZoom={-5}
                    zoom = {-5}
                    // scaleY={{
                    //     scaleY: 1,
                    //     minScaleY: 1,
                    //     maxScaleY: 10,
                    //     position: 'topleft',
                    // }}
                    drawTools = {{
                        drawMarker: true,
                        drawPolygon: true,
                        drawPolyline: true,
                        position: "topright",
                        
                    }}
                    mousePosition = {{
                        coordinatePosition: "bottomright",
                    }}
                    switch={{
                        value: switchValue,
                        label: 'Hillshading',
                        position: 'bottomleft'
                    }}
                    setProps={onChange}
                />
            </div>
            <div >
                <NewLayeredMap 
                    id={"NewLayeredMap-2"}
                    syncedMaps={["NewLayeredMap-1", "NewLayeredMap-3"]}
                    syncDrawings={true}
                    // layers={exampleData.layers}
                    layers={layers}
                    /*center={[432205, 6475078], [432205, 6475078]} */
                    // bounds={[[432205, 6475078], [437720, 6481113]] /* [[432205, 6475078], [437720, 6481113]] */}
                    // crs="earth"
                    crs="simple"
                    minZoom={-5}
                    zoom = {-5} 
                    // setProps={e => console.log(e)}
                    // scaleY={{
                    //     scaleY: 1,
                    //     minScaleY: 1,
                    //     maxScaleY: 10,
                    //     position: 'topleft',
                    // }}
                    mouseCoords = {{
                        position: "bottomleft",
                    }}
                    drawTools = {{
                        drawMarker: true,
                        drawPolygon: true,
                        drawPolyline: true,
                        position: "topright",
                        
                    }}
                    switch={{
                        value: switchValue,
                        label: 'Hillshading',
                        position: 'bottomleft'
                    }}
                    setProps={onChange}
                />
            </div>
            <div>
                <NewLayeredMap 
                    id={"NewLayeredMap-3"}
                    syncedMaps={["NewLayeredMap-2", "NewLayeredMap-1"]}
                    syncDrawings={true}
                    layers={exampleData.layers}
                    // center={[0, 0]}
                    crs="simple"
                    // center={[432205, 6475078], [432205, 6475078]}
                    // bounds={[[432205, 6475078], [437720, 6481113]] /* [[432205, 6475078], [437720, 6481113]] */}
                    minZoom={-5}
                    // scaleY={{
                    //     scaleY: 1,
                    //     minScaleY: 1,
                    //     maxScaleY: 10,
                    //     position: 'topleft',
                    // }}
                    drawTools = {{
                        drawMarker: true,
                        drawPolygon: true,
                        drawPolyline: true,
                        position: "topright",
                        
                    }}
                    switch={{
                        value: switchValue,
                        label: 'Hillshading',
                        position: 'bottomleft'
                    }}
                    setProps={onChange}
                />
            </div>
        </ div>
        
    )
}

export default NewLayeredMapDemo;