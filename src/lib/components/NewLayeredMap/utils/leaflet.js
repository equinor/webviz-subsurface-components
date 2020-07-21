export const getShapeType = layer => {
    if (layer instanceof L.Rectangle) {
        return "rectangle";
    }
    if (layer instanceof L.Circle) {
        return "circle";
    }
    if (layer instanceof L.CircleMarker) {
        return "circleMarker";
    }
    if (layer instanceof L.Marker) {
        return "marker";
    }
    if (layer instanceof L.Polygon) {
        return "polygon";
    }
    if (layer instanceof L.Polyline) {
        return "polyline";
    }
    throw new Error("Unknown shape type");
};

// Helper functions
const yx = ([x, y]) => {
    return [y, x];
};

const addTooltip = (item, shapeObject) => {
    if ("tooltip" in item) {
        return shapeObject.bindTooltip(item.tooltip);
    }
    return shapeObject;
}

// Layer utils
export const makePolyline = (item, swapXY, setProps) => {
    const pos = swapXY ? item.positions.map(xy => yx(xy)) : item.positions;
    return addTooltip(item, 
                (L.polyline(pos, {
                    onClick: () => setProps(positions),
                    color: item.color || "blue",
                    positions: pos
                })
    ));
}

export const makePolygon = (item, swapXY, setProps) => {
    const pos = swapXY ? item.positions.map(xy => yx(xy)) : item.positions;
    return addTooltip(item, 
                (L.polygon(pos, {
                    onClick: () => setProps(positions),
                    color: item.color || "blue",
                    positions: pos
                })
    ));
}

export const makeMarker = (item, swapXY) => {
    const pos = swapXY ? yx(item.position): item.position;
    return  addTooltip(item, 
                L.marker(pos)
    );
}

export const makeCircle = (item, swapXY) => {
    const center = swapXY ? yx(item.center) : item.center;
    return  addTooltip(item, 
                (L.circle(center, {
                    color: item.color || "red",
                    center : center,
                    radius : item.radius
                })
    ));
}

export const makeCircleMarker = (item, swapXY) => {
    const center = swapXY ? yx(item.center) : item.center;
    return  addTooltip(item, 
                (L.circleMarker(center, {
                    color: item.color || "red",
                    center : center,
                    radius : item.radius || 4,
                })
    ));
}

export const addImage = (imageData) => {
    const bounds = (imageData.bounds || []).map(xy => yx(xy));
    let newImageLayer = null;
    newImageLayer = L.imageWebGLOverlay(imageData.url, bounds, {
        ...imageData,
        minvalue: imageData.minvalue,
        maxvalue: imageData.maxvalue,
        colorScale: imageData.colorScale,
        shader: imageData.shader,
    });
    
    return newImageLayer;
}

export const addTile = (tileData) => {
    let newTileLayer = null;
    if(tileData.colorScale) {
        newTileLayer = L.tileWebGLLayer(tileData.url, {
            ...tileData,
            minvalue: tileData.minvalue,
            maxvalue: tileData.maxvalue,
            colorScale: tileData.colorScale,
            shader: tileData.shader,
        })
    } else {
        newTileLayer = L.tileLayer(tileData.url, {
            ...tileData,
        })
    }
    return newTileLayer;
}

