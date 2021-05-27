import * as d3 from "d3";
export interface PlotLayout {
    width: number;
    height: number;
    xRange: [number, number];
    yRange: [number, number];
    xExtent: number;
    yExtent: number;
    topLeft: [number, number];
    bottomRight: [number, number];
}

export interface Padding {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export const getLayout = (
    width: number,
    height: number,
    padding: Padding = { bottom: 0, top: 0, left: 0, right: 0 }
): PlotLayout => {
    const xRange: [number, number] = [padding.left, width - padding.right];
    const yRange: [number, number] = [height - padding.bottom, padding.top];
    const xExtent = Math.abs(xRange[0] - xRange[1]);
    const yExtent = Math.abs(yRange[0] - yRange[1]);
    const topLeft: [number, number] = [padding.left, padding.top];
    const bottomRight: [number, number] = [
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
};

export const updateOrCreate = (
    selection: d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown>,
    element: string,
    elementClass: string
): d3.Selection<d3.BaseType, unknown, d3.BaseType, unknown> => {
    if (selection.select(element + "." + elementClass).empty())
        return selection.append(element).attr("class", elementClass);
    return selection.select(element + "." + elementClass);
};

export const getSvg = (
    div: HTMLDivElement,
    id = "default"
): d3.Selection<d3.BaseType, unknown, null, undefined> => {
    const boundingRect = div.getBoundingClientRect();
    return d3
        .select(div)
        .call(updateOrCreate, "svg", "svg-context-" + id)
        .select("svg.svg-context-" + id)
        .style("position", "relative")
        .attr("width", boundingRect.width)
        .attr("height", boundingRect.height)
        .attr("id", "svg-context-" + id);
};
