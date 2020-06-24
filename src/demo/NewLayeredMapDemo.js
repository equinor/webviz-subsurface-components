import React from 'react';

// Components
import LayeredMap from '../lib/components/NewLayeredMap';

// Assets
import exampleData from './example-data/new-layered-map.json';

const NewLayeredMapDemo = () => {

    return (
        <div style={{maxWidth: 1000, margin: 'auto', display: 'block', border: '1px solid black', marginTop: 24}}>
            <LayeredMap 
                layers={exampleData.layers}
                center={[432205, 6475078]}
                bounds={[[432205, 6475078], [437720, 6481113]]}
                crs="simple"
                minZoon={1}
                controls={{
                    scaleY: {
                        scaleY: 1,
                        minScaleY: 1,
                        maxScaleY: 10,
                        position: 'topleft',
                    },
                }}
            />
        </div>
    )
}

export default NewLayeredMapDemo;