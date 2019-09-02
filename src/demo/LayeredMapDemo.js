import React, {Component} from 'react';
import LayeredMap  from '../lib/components/LayeredMap';

const data = require('./example-data/layered-map.json');

class LayeredMapDemo extends Component {
  render() {
    return <LayeredMap id={'layered-map-demo'} 
                       map_bounds={data.map_bounds}
                       center={data.center}
                       layers={data.layers}
                       overlay_layers={data.overlay_layers}
                       setProps={(e) => console.log(e)}
           />
  }
}

export default LayeredMapDemo;
