import React, { useState } from 'react';

// Components
import NewLayeredMap from '../lib/components/NewLayeredMap';

// Assets
import exampleData from './example-data/new-layered-map.json';
import { NewLayeredMap } from '../lib/index';

const NewLayeredMapDemo = () => {

    const [switchValue, setSwitchValue] = useState(false);

    const layers = exampleData.layers

    const onChange = (changes) => {
        if(changes.switch) {
            setSwitchValue(changes.switch.value);
            console.log('toggle toggled');
            if (!layers[0].action == 'delete') {
                layers[0].action = 'delete';
            } else {
                layers[0].action = 'add';
            }
                
        }
    }

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div >
                <NewLayeredMap 
                    id={"NewLayeredMap-1"}
                    syncedMaps={["NewLayeredMap-2"]}
                    layers={layers}
                    center={[0, 0]}
                    /*center={[432205, 6475078], [432205, 6475078]} */
                   // bounds={[[432205, 6475078], [437720, 6481113]] /* [[432205, 6475078], [437720, 6481113]] */}
                    // crs="earth"
                    //crs="earth"
                    //minZoom={-5}
                    //zoom = {-5} 
                    // setProps={e => console.log(e)}

                    //minZoom={-5}
                    //zoom = {-5}
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
                    syncedMaps={["NewLayeredMap-1"]}
                    layers={layers}
                    /*center={[432205, 6475078], [432205, 6475078]} */
                    // bounds={[[432205, 6475078], [437720, 6481113]] /* [[432205, 6475078], [437720, 6481113]] */}
                    // crs="earth"
                    // crs="simple"
                    minZoom={-5}
                    zoom = {-5} 
                    // setProps={e => console.log(e)}
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