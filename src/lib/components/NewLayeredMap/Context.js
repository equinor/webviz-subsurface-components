import React from 'react';
import L from 'leaflet';

const Context = React.createContext({
    drawLayer: {}, 
    syncedDrawLayer: {data: []},
    syncedDrawLayerAdd: () => {},
    syncedDrawLayerDelete: () => {},
    focusedImageURL: null,
});
export default Context;

export const WithContext = Component => {

    return React.forwardRef((props, ref) => {
        return (
            <Context.Consumer>
                { context => <Component ctx={context} {...props} ref={ref} />}
            </Context.Consumer>
        )
    })
}