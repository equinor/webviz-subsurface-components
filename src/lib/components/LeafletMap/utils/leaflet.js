/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import L from "leaflet";

export const getShapeType = (layer) => {
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
};

// Layer utils
export const makePolyline = (item, swapXY, setProps) => {
    const pos = swapXY ? item.positions.map((xy) => yx(xy)) : item.positions;
    const shape = addTooltip(
        item,
        L.polyline(pos, {
            color: item.color || "blue",
            positions: pos,
        })
    );
    shape.on("mouseup", () => {
        setProps({ clicked_shape: item });
    });
    return shape;
};

export const makePolygon = (item, swapXY, setProps) => {
    const pos = swapXY ? item.positions.map((xy) => yx(xy)) : item.positions;
    const shape = addTooltip(
        item,
        L.polygon(pos, {
            color: item.color || "blue",
            positions: pos,
        })
    );
    shape.on("mouseup", () => {
        setProps({ clicked_shape: item });
    });
    return shape;
};

export const makeMarker = (item, swapXY, setProps) => {
    const pos = swapXY ? yx(item.position) : item.position;
    const shape = addTooltip(item, L.marker(pos));
    shape.on("mouseup", () => {
        setProps({ clicked_shape: item });
    });
    return shape;
};

export const makeCircle = (item, swapXY, setProps) => {
    const center = swapXY ? yx(item.center) : item.center;
    const shape = addTooltip(
        item,
        L.circle(center, {
            color: item.color || "red",
            center: center,
            radius: item.radius,
        })
    );
    shape.on("mouseup", () => {
        setProps({ clicked_shape: item });
    });
    return shape;
};

export const makeCircleMarker = (item, swapXY) => {
    const center = swapXY ? yx(item.center) : item.center;
    return addTooltip(
        item,
        L.circleMarker(center, {
            color: item.color || "red",
            center: center,
            radius: item.radius || 4,
        })
    );
};

export const addImage = (imageData) => {
    const bounds = (imageData.bounds || []).map((xy) => yx(xy));
    const newImageLayer = L.imageWebGLOverlay(imageData.url, bounds, {
        ...imageData,
        minvalue: imageData.minvalue,
        maxvalue: imageData.maxvalue,
        colorScale: imageData.colorScale,
        shader: imageData.shader,
    });

    return newImageLayer;
};

export const addTile = (tileData) => {
    const newTileLayer = L.tileWebGLLayer(tileData.url, {
        ...tileData,
        minvalue: tileData.minvalue,
        maxvalue: tileData.maxvalue,
        colorScale: tileData.colorScale,
        shader: tileData.shader,
    });
    return newTileLayer;
};
