import React from 'react';

// Components
import LayeredMap from '../lib/components/NewLayeredMap';

// Assets
import exampleData from './example-data/layered-map.json';
import { NewLayeredMap } from '../lib/index';

const NewLayeredMapDemo = () => {

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div >
                <LayeredMap 
                    id={"NewLayeredMap-1"}
                    syncedMaps={["NewLayeredMap-2"]}
                    layers={exampleData.layers}
                    center={[432205, 6475078]/* [432205, 6475078] */}
                    bounds={[[432205, 6475078], [437720, 6481113]] /* [[432205, 6475078], [437720, 6481113]] */}
                    // crs="earth"
                    crs="simple"
                    minZoom={-5}
                    zoom = {-5}
                    setProps={e => console.log(e)}
                    controls={{
                        scaleY: {
                            scaleY: 1,
                            minScaleY: 1,
                            maxScaleY: 10,
                            position: 'topleft',
                        },
                        drawTools: {
                            drawMarker: true,
                            drawPolygon: true,
                            drawPolyline: true,
                            position: "topright",
                            
                        }
                    }}
                />
            </div>
            <div >
                <LayeredMap
                    id={"NewLayeredMap-2"}
                    syncedMaps={["NewLayeredMap-1"]}
                    layers={exampleData.layers}
                    center={[432205, 6475078]}
                    bounds={[[432205, 6475078], [437720, 6481113]]}
                    // crs="earth"
                    crs="simple"
                    minZoom={-5}
                    zoom = {-5}
                    setProps={e => console.log(e)}
                    controls={{
                        scaleY: {
                            scaleY: 1,
                            minScaleY: 1,
                            maxScaleY: 10,
                            position: 'topleft',
                        },
                        drawTools: {
                            drawMarker: true,
                            drawPolygon: true,
                            drawPolyline: true,
                            position: "topright",
                            
                        }
                    }}
                />
            </div>
        </div>
        
    )
}

export default NewLayeredMapDemo;