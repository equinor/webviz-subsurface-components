import React from 'react';

// Components
import LayeredMap from '../lib/components/NewLayeredMap';

// Assets
import exampleData from './example-data/layered-map.json';

const NewLayeredMapDemo = () => {

    return (
        <div style={{maxWidth: 1000, margin: 'auto', display: 'block', border: '1px solid black', marginTop: 24}}>
            <LayeredMap 
                layers={exampleData.layers}
            />
        </div>
    )
}

export default NewLayeredMapDemo;