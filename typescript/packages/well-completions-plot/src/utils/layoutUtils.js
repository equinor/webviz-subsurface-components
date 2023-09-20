export function createLayout(width, height, padding = { bottom: 0, top: 0, left: 0, right: 0 }) {
    const xRange = [padding.left, width - padding.right];
    const yRange = [height - padding.bottom, padding.top];
    const xExtent = Math.abs(xRange[0] - xRange[1]);
    const yExtent = Math.abs(yRange[0] - yRange[1]);
    const topLeft = [padding.left, padding.top];
    const bottomRight = [
        width - padding.right,
        height - padding.bottom,
    ];
    return {
        width: width,
        height: height,
        xRange: xRange,
        yRange: yRange,
        xExtent: xExtent,
        yExtent: yExtent,
        topLeft: topLeft,
        bottomRight: bottomRight,
    };
}
//# sourceMappingURL=layoutUtils.js.map