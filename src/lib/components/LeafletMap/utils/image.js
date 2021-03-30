/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

export const loadImage = (src, config = {}) =>
    new Promise((resolve) => {
        const img = new Image();
        if (config.crossOrigin || config.crossOrigin === "") {
            requestCORSIfNotSameOrigin(
                img,
                src,
                config.crossOrigin === true ? "" : config.crossOrigin
            );
        }

        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => resolve(img);
    });

const requestCORSIfNotSameOrigin = (img, url, value) => {
    if (
        new URL(url, window.location.href).origin !== window.location.origin &&
        !url.startsWith("data:")
    ) {
        img.crossOrigin = value;
    }
};

/**
 *
 * @param {HTMLImageElement|String} loadedImage
 * @param {Number} scaleX
 * @param {Number} scaleY
 * @returns {Promise<HTMLImageElement>}
 */
export const scaleImage = async (loadedImage, scaleX, scaleY) => {
    if (typeof loadedImage === "string") {
        loadedImage = await loadImage(loadedImage);
    }

    const scaleCanvas = document.createElement("canvas");
    const ctx = scaleCanvas.getContext("2d");
    scaleCanvas.width = loadedImage.width * scaleX;
    scaleCanvas.height = loadedImage.height * scaleY;
    ctx.scale(scaleX, scaleY);
    ctx.drawImage(loadedImage, 0, 0);
    return scaleCanvas.toDataURL("image/png");
};

/**
 *
 * @param {Array<String|HTMLImageElement>} tiles
 * @param {Number} dimX
 * @param {Number} dimY
 * @returns {[String, Array<HTMLImageElement>, Number]} Base64 URL of the merged image
 */
export const tilesToImage = async (tiles, options = {}) => {
    if (tiles.length === 0) {
        return null;
    }

    let [minX, maxX, minY, maxY] = [
        Number.MAX_VALUE,
        Number.MIN_VALUE,
        Number.MAX_VALUE,
        Number.MIN_VALUE,
    ];
    tiles.forEach(({ coords }) => {
        if (coords.x > maxX) {
            maxX = coords.x;
        }
        if (coords.x < minX) {
            minX = coords.x;
        }
        if (coords.y > maxY) {
            maxY = coords.y;
        }
        if (coords.y < minY) {
            minY = coords.y;
        }
    });
    const dimX = maxX - minX + 1;
    const dimY = maxY - minY + 1;

    // Make sure all the images are HTMLImageElement.
    tiles.forEach((tile) => {
        tile.image =
            typeof tile.image === "string"
                ? loadImage(tile.image, options).catch(() => null)
                : Promise.resolve(tile.image);
    });
    const loadedTiles = await Promise.all(tiles.map((tile) => tile.image));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const size = loadedTiles[0].width;
    canvas.width = size * dimX;
    canvas.height = size * dimY;

    // Merge them into a grid
    for (let i = 0; i < loadedTiles.length; i++) {
        const tile = tiles[i];
        const coords = tile.coords;
        const x = coords.x - minX;
        const y = coords.y - minY;
        const image = loadedTiles[i];

        if (image instanceof HTMLImageElement) {
            ctx.drawImage(image, x * size, y * size, size, size);
        }
    }
    return {
        url: canvas.toDataURL(),
        size: size,
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY,
        loadedImages: loadedTiles,
    };
};
