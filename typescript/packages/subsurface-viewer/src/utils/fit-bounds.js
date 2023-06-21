// Returns map settings {latitude, longitude, zoom}
// that will contain the provided corners within the provided width.
// Only supports non-perspective mode.

export function clamp(x, min, max) {
    return x < min ? min : x > max ? max : x;
}

function ieLog2(x) {
    return Math.log(x) * Math.LOG2E;
}

// Handle missing log2 in IE 11
export const log2 = Math.log2 || ieLog2;

export default function fitBounds({
    width,
    height,
    bounds,
    minExtent = 0, // 0.01 would be about 1000 meters (degree is ~110KM)
    maxZoom = 24, // ~x4,000,000 => About 10 meter extents
    // options
    padding = 0,
    offset = [0, 0],
}) {
    if (Number.isFinite(padding)) {
        const p = padding;
        padding = {
            top: p,
            bottom: p,
            left: p,
            right: p,
        };
    } else {
        // Make sure all the required properties are set
        console.assert(
            Number.isFinite(padding.top) &&
                Number.isFinite(padding.bottom) &&
                Number.isFinite(padding.left) &&
                Number.isFinite(padding.right)
        );
    }

    const [west, south] = [bounds[0], bounds[1]];
    const [east, north] = [bounds[2], bounds[3]];

    const nw = [west, north];
    const se = [east, south];

    // width/height on the Web Mercator plane
    const size = [
        Math.max(Math.abs(se[0] - nw[0]), minExtent),
        Math.max(Math.abs(se[1] - nw[1]), minExtent),
    ];

    const targetSize = [
        width - padding.left - padding.right - Math.abs(offset[0]) * 2,
        height - padding.top - padding.bottom - Math.abs(offset[1]) * 2,
    ];

    // scale = screen pixels per unit on the Web Mercator plane
    const scaleX = targetSize[0] / size[0];
    const scaleY = targetSize[1] / size[1];

    // Find how much we need to shift the center
    const offsetX = (padding.right - padding.left) / 2 / scaleX;
    const offsetY = (padding.bottom - padding.top) / 2 / scaleY;

    const center = [
        (se[0] + nw[0]) / 2 + offsetX,
        (se[1] + nw[1]) / 2 + offsetY,
    ];

    const centerLngLat = center;
    let zoom = Math.min(maxZoom, log2(Math.abs(Math.min(scaleX, scaleY))));
    if (!Number.isFinite(zoom)) {
        zoom = 0;
    }

    return {
        x: centerLngLat[0],
        y: centerLngLat[1],
        zoom,
    };
}
