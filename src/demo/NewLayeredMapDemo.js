import React from 'react';

// Components
import LayeredMap from '../lib/components/NewLayeredMap';


const NewLayeredMapDemo = () => {

    return (
        <div style={{maxWidth: 1000, margin: 'auto', display: 'block', border: '1px solid black', marginTop: 24}}>
            <LayeredMap />
        </div>
    )
}

export default NewLayeredMapDemo;