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


const testLayers = [
    {
        id: 10,
        name: "TEST1",
        baseLayer: true,
        checked: true,
        action: "add",
        data: [
            {
                type: "image",
                url: exampleData.layers[1].data[0].url,
                colorScale: {
                    colors: ["#2A4365", "#2C5282", "#2B6CB0", "#3182CE", "#4299E1", "#63B3ED", "#90CDF4", "#BEE3F8", "#EBF8FF"],
                },
                bounds: exampleData.layers[1].data[0].bounds,
                shader: {
                    setBlackToAlpha: true,
                },
                minvalue: 20,
                maxvalue: 120,
            }
        ]
    },
    {
        id: 11,
        name: "TEST2",
        baseLayer: true,
        checked: true,
        action: "add",
        data: [
            {
                type: "image",
                url: exampleData.layers[1].data[0].url,
                colorScale: {
                    colors: ["#234E52", "#285E61", "#2C7A7B", "#319795", "#38B2AC", "#4FD1C5", "#81E6D9", "#B2F5EA", "#E6FFFA"],
                },
                bounds: exampleData.layers[1].data[0].bounds,
                shader: {
                    setBlackToAlpha: true,
                },
                minvalue: 500,
                maxvalue: 800,
            }
        ]
    }
]

const NewLayeredMapDemo = () => {


    const [switchValue, setSwitchValue] = useState(true);
    const [layers, setLayers] = useState(exampleData.layers.slice(1, 3).reverse());

    const onChange = (changes) => {
        console.log("Changes :D", changes);
        const newLayers = Object.assign([], layers);
        if(changes.switch) {
            setSwitchValue(changes.switch.value);
            newLayers[0].action = "update";
            if (changes.switch.value === true) {
                newLayers[0].data[0].shader.type = 'hillshading';
                newLayers[0].data[0].shader.shadows = true;
                newLayers[0].data[0].colorScale = DEFAULT_COLORMAP;
            } else {
                newLayers[0].data[0].shader.type = null;
                newLayers[0].data[0].colorScale = {
                    "colors": ["#000000", "#ffffff"]
                };
            }
        }
        setLayers(newLayers)
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: '90vh'}}>
            <div>
                <NewLayeredMap 
                    id={"NewLayeredMap-1"}
                    // syncedMaps={["NewLayeredMap-2", "NewLayeredMap-1"]}
                    // syncDrawings={true}
                    updateMode={"replace"}
                    // layers={exampleData.layers}
                    layers={layers}
                    center={[0, 0]}
                    // center={[432205, 6475078], [432205, 6475078]} 
                    // defaultBounds={[[432205, 6475078], [437720, 6481113]] [[432205, 6475078], [437720, 6481113]]}
                    crs="simple"
                    //crs="earth"
                    //minZoom={-5}
                    //zoom = {-5} 
                    // setProps={e => console.log(e)}

                    minZoom={-5}
                    // zoom = {-5}
                    colorBar={{
                        position: 'bottomleft'
                    }}
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
                     mouseCoords = {{
                        position: "bottomright",
                    }} 
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
                    colorBar={{
                        position: 'bottomleft'
                    }}
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
            </div>  */}
        </ div>
        
    )
}

export default NewLayeredMapDemo;