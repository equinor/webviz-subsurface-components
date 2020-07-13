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

    const layer2 = JSON.parse(JSON.stringify(layers));
    layer2[0].data[0].shader.type = null;
    layer2[0].data[0].colorScale.prefixZeroAlpha = true;


    return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr auto" }}>
            <div >
                <NewLayeredMap 
                    id={"NewLayeredMap-1"}
                    syncedMaps={["NewLayeredMap-2", "NewLayeredMap-3"]}
                    layers={layers}
                    // center={[0, 0]}
                    center={[432205, 6475078], [432205, 6475078]} 
                    bounds={[[432205, 6475078], [437720, 6481113]] [[432205, 6475078], [437720, 6481113]]}
                    // crs="earth"
                    //crs="earth"
                    //minZoom={-5}
                    //zoom = {-5} 
                    // setProps={e => console.log(e)}

                    minZoom={-5}
                    zoom = {-5}
                    scaleY={{
                        scaleY: 1,
                        minScaleY: 1,
                        maxScaleY: 10,
                        position: 'topleft',
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
            <div >
                <NewLayeredMap 
                    id={"NewLayeredMap-2"}
                    syncedMaps={["NewLayeredMap-1", "NewLayeredMap-3"]}
                    layers={layer2}
                    // bounds={[[432205, 6475078], [437720, 6481113]]}
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
           {/*  <div>
                <NewLayeredMap 
                    id={"NewLayeredMap-3"}
                    syncedMaps={["NewLayeredMap-2", "NewLayeredMap-1"]}
                    layers={layers}
                    // center={[0, 0]}
                    center={[432205, 6475078], [432205, 6475078]}
                    bounds={[[432205, 6475078], [437720, 6481113]] }
                    minZoom={-5}
                    scaleY={{
                        scaleY: 1,
                        minScaleY: 1,
                        maxScaleY: 10,
                        position: 'topleft',
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
        </div>
        
    )
}

export default NewLayeredMapDemo;