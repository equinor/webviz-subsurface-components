import React from "react";

const Context = React.createContext({
    drawLayer: {},
    syncedDrawLayer: { data: [] },
    syncedDrawLayerAdd: () => {},
    syncedDrawLayerDelete: () => {},
});
export default Context;
