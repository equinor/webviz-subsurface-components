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
                center={[0, 0]/* [432205, 6475078] */}
                bounds={null /* [[432205, 6475078], [437720, 6481113]] */}
                crs="earth"
                minZoon={1}
            />
        </div>
    )
}

export default NewLayeredMapDemo;