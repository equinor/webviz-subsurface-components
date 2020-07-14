import React, { Component } from 'react';
import L from 'leaflet';
export default React.createContext({
    drawLayer: {}, 
    syncedDrawLayer: {data: []},
    syncedDrawLayerAdd: () => {},
    syncedDrawLayerDelete: () => {},
});

// class DrawLayerContextProvider extends Component {
//     constructor(props) {
//         super(props);

//         // const drawLayer = new L.featureGroup();
//         this.state = {
//             drawLayer: drawLayer
//         }
//     }

//     render() {
//         return null
//     }
// }

// export { DrawLayerContextProvider, Consumer as DrawLayerContextConsumer };
