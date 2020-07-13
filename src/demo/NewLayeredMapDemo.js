import React, { useState } from 'react';

// Components
import NewLayeredMap from '../lib/components/NewLayeredMap';

// Assets
import exampleData from './example-data/new-layered-map.json';
import { NewLayeredMap } from '../lib/index';

const NewLayeredMapDemo = () => {

    const [switchValue, setSwitchValue] = useState(false);

    const layers = exampleData.layers
    const colorArr = ["#713e38", "#867e48", "#79951e", "#e315f7", "#f84817", "#2cedbc", "#8dca66", "#3c4e70", "#5dde6d", "#88d16d"];
    const colorArr2 = ["#0d0887", "#46039f", "#7201a8", "#9c179e", "#bd3786", "#d8576b", "#ed7953", "#fb9f3a", "#fdca26", "#f0f921"]
    const worldsBestColormap = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAABCAYAAAAxWXB3AAAA2UlEQVQ4T51TSQ7DMAgcnEtv/XZ/TTUsNtBUqnqIMDALcrAAwPPx0gXBUgHjBVjcX9Rr7dKBKfzEbZ3Cp98CIKbfz7I12U/9c/aa19vZePea5ieAiDpGmGtEcvT0iTN86f/Boyf9zJNxnbzVR899yxe8j3rwar16msYaWk239jhs9fyVp7Tc88L8Zn60eLF1pu0ZvJ5rmcl52U9P9+OPjxh3YriKn7iGD11bjKGXOFsg4jK6J5cp/cn1xXS9b/jsOe8LPh6Ihp/GI/Ec8FzRc0BDs+M18Ozf898yFZ4Lp0OHxQAAAABJRU5ErkJggg=="
    const oldBoringColormap =  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAABCAYAAAAxWXB3AAAAuElEQVR4nI2NyxUDIQwDR6K0lJD+W1nnABgvIZ8DT7JGNnroieRAQjJYMFQ2SDBUk0mrl16odGce05de9Z2zzStLLhEuvurIZzeZOedizd7mT70f7JOe7v7XA/jBBaH4ztn3462z37l1c7/ys1f6QFNZuUZ+1+JZ3oVN79FxctLvLB/XIQuslbe3+eSv7LVyd/KmC9O13Vjf63zt7r3kW7dR/iVuvv/H8NBE1/SiIayhiCZjhDFN5gX8UYgJzVykqAAAAABJRU5ErkJggg=="

    const onChange = (changes) => {
        if(changes.switch) {
            setSwitchValue(changes.switch.value);
            console.log('toggle value', changes.switch.value);
            console.log('action: ', layers[0].action)
            if (changes.switch.value == true) {
                layers[1].data[0].colorScale = worldsBestColormap;
            } else {
                layers[1].data[0].colorScale = oldBoringColormap;
            }
            console.log('action after change ', layers[0].action)
        }
    }
    // const onChange = (changes) => {
    //     if(changes.switch) {
    //         setSwitchValue(changes.switch.value);
    //         console.log('toggle value', changes.switch.value);
    //         console.log('action: ', layers[0].action)
    //         if (changes.switch.value == true) {
    //             layers[1].data[0].colorScale.colors = colorArr;
    //         } else {
    //             layers[1].data[0].colorScale.colors = colorArr2;
    //         }
    //         console.log('action after change ', layers[0].action)
    //     }
    // }

    // const layer = exampleData.layers.slice(1);
    // const layer2 = JSON.parse(JSON.stringify(layer));
    // layer2[0].data[0].colorScale = null;
    // const layer3 = JSON.parse(JSON.stringify(layer2));
    // layer3[0].data[0].colormap = null;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div >
                <NewLayeredMap 
                    id={"NewLayeredMap-1"}
                    syncedMaps={["NewLayeredMap-2", "NewLayeredMap-3"]}
                    layers={exampleData.layers}
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
                    switch={{
                        value: switchValue,
                        label: 'Useless toggle',
                        position: 'bottomleft'
                    }}
                    setProps={onChange}
                />
            </div>
            <div >
                <NewLayeredMap 
                    id={"NewLayeredMap-2"}
                    syncedMaps={["NewLayeredMap-1", "NewLayeredMap-3"]}
                    layers={exampleData.layers}
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
                    drawTools = {{
                        drawMarker: true,
                        drawPolygon: true,
                        drawPolyline: true,
                        position: "topright",
                        
                    }}
                    switch={{
                        value: switchValue,
                        label: 'Useless toggle',
                        position: 'bottomleft'
                    }}
                    setProps={onChange}
                />
            </div>
            <div>
                <NewLayeredMap 
                    id={"NewLayeredMap-3"}
                    syncedMaps={["NewLayeredMap-2", "NewLayeredMap-1"]}
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
                        label: 'Useless toggle',
                        position: 'bottomleft'
                    }}
                    setProps={onChange}
                />
            </div>
        </div>
        
    )
}

export default NewLayeredMapDemo;