import React from 'react';

// Components
import LayeredMap from '../lib/components/NewLayeredMap';

// Assets
import exampleData from './example-data/new-layered-map.json';
import { NewLayeredMap } from '../lib/index';

const NewLayeredMapDemo = () => {

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div >
                <LayeredMap 
                    id={"NewLayeredMap-1"}
                    syncedMaps={["NewLayeredMap-2"]}
                    syncOpt={['zoom', 'pos']}
                    layers={exampleData.layers}
                    center={[0, 0]/* [432205, 6475078] */}
                    bounds={null /* [[432205, 6475078], [437720, 6481113]] */}
                    crs="earth"
                    minZoom={1}
                    zoom = {2}
                    controls={{
                        scaleY: {
                            scaleY: 1,
                            minScaleY: 1,
                            maxScaleY: 10,
                            position: 'topleft'
                        },
                    }}
                />
            </div>
            <div >
                <LayeredMap
                    id={"NewLayeredMap-2"}
                    syncedMaps={["NewLayeredMap-1"]}
                    syncOpt={['zoom', 'pos']}
                    layers={exampleData.layers}
                    center={[0, 0]/* [432205, 6475078] */}
                    bounds={null /* [[432205, 6475078], [437720, 6481113]] */}
                    crs="earth"
                    minZoom={1}
                    zoom = {2}
                    controls={{
                        scaleY: {
                            scaleY: 1,
                            minScaleY: 1,
                            maxScaleY: 10,
                            position: 'topleft'
                        },
                    }}
                />
            </div>
        </div>
        
    )
}

export default NewLayeredMapDemo;