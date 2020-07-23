import React, { useState } from 'react';

// Components
import NewLayeredMap from '../lib/components/NewLayeredMap';

// Assets
import exampleData from './example-data/new-layered-map.json';
import { NewLayeredMap } from '../lib/index';

const DEFAULT_COLORMAP = {
    "colors":["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"],
    "prefixZeroAlpha": false,
    "scaleType": "linear",
    "cutPointMin": 2782,
    "cutPointMax": 3513
};

const NewLayeredMapDemo = () => {

    const [switchValue, setSwitchValue] = useState(true);

    const layers = exampleData.layers.slice(0, 1)

    const onChange = (changes) => {
        // console.log("Changes :D", changes);
        if(changes.switch) {
            setSwitchValue(changes.switch.value);
            if (changes.switch.value === true) {
                layers[0].data[0].shader.type = 'hillshading';
                layers[0].data[0].colorScale = DEFAULT_COLORMAP;
            } else {
                layers[0].data[0].shader.type = null;
                layers[0].data[0].colorScale = null;
            }
        }
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", height: '90vh'}}>
            <div>
                <NewLayeredMap 
                    id={"NewLayeredMap-1"}
                    syncedMaps={["NewLayeredMap-2", "NewLayeredMap-1"]}
                    syncDrawings={true}
                    // layers={exampleData.layers}
                    layers={layers}
                    center={[0, 0]}
                    // center={[432205, 6475078], [432205, 6475078]} 
                    // defaultBounds={[[432205, 6475078], [437720, 6481113]] [[432205, 6475078], [437720, 6481113]]}
                    crs="earth"
                    //crs="earth"
                    //minZoom={-5}
                    //zoom = {-5} 
                    // setProps={e => console.log(e)}

                    minZoom={-5}
                    // zoom = {-5}
                    colorBar={{
                        position: 'bottomleft'
                    }}
                   /*  scaleY={{
                        scaleY: 1,
                        minScaleY: 1,
                        maxScaleY: 10,
                        position: 'topleft',
                    }} */
                    drawTools = {{
                        drawMarker: true,
                        drawPolygon: true,
                        drawPolyline: true,
                        position: "topright",
                        
                    }}
                  /*   mouseCoords = {{
                        position: "bottomright",
                    }} */
                    switch={{
                        value: switchValue,
                        label: 'Hillshading',
                        position: 'bottomleft'
                    }}
                    setProps={onChange}
                />
            </div>
            {/* <div >
                <NewLayeredMap 
                    id={"NewLayeredMap-2"}
                    syncedMaps={["NewLayeredMap-1", "NewLayeredMap-2"]}
                    syncDrawings={true}
                    // layers={exampleData.layers}
                    layers={layers}
                    // center={[432205, 6475078], [432205, 6475078]}
                    // defaultBounds={[[432205, 6475078], [437720, 6481113]]}
                    // crs="earth"
                    crs="simple"
                    minZoom={-5}
                    zoom = {-5} 
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
            </div> */}
        </ div>
        
    )
}

export default NewLayeredMapDemo;