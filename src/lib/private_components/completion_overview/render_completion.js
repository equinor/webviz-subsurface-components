import * as d3 from "d3";

function render_completion(parent_id, layers, data, height) {
    const SPACE_LABEL_PLOT = 5; // Space between labels and plot, in pixels

    const parent = d3.select("#" + parent_id);

    const width = parent.node().offsetWidth;

    const svg = parent
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const dates = Object.keys(data).sort();
    const wells = Object.keys(data)
        .flatMap(date => Object.keys(data[date]))
        .sort();

    const number_layers = layers.length;
    const layer_colors = d3
        .scaleOrdinal()
        .domain(d3.range(number_layers))
        .range(d3.schemePastel1);

    const layer2pixels = d3
        .scaleLinear()
        .domain([0, number_layers])
        .range([0, height]);
    const layer_height = layer2pixels(1) - layer2pixels(0);

    const g_layer_labels = svg.append("g");

    g_layer_labels
        .selectAll()
        .data(d3.range(number_layers))
        .enter()
        .append("text")
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "end")
        .attr("y", d => layer2pixels(d) + 0.5 * layer_height)
        .text(d => layers[d]);

    const width_labels = g_layer_labels.node().getBBox().width;
    g_layer_labels.attr("transform", `translate(${width_labels}, 0)`);

    const width_layers = width - width_labels - SPACE_LABEL_PLOT;

    const horizontal_offset_wells = d3
        .scaleLinear()
        .domain([0, wells.length - 1])
        .range([0.1 * width_layers, 0.9 * width_layers]);

    const g_completion_plot = svg
        .append("g")
        .attr("transform", `translate(${width_labels + SPACE_LABEL_PLOT}, 0)`);

    g_completion_plot
        .append("g")
        .selectAll()
        .data(d3.range(number_layers))
        .enter()
        .append("rect")
        .attr("y", i => layer2pixels(i))
        .attr("width", width_layers)
        .attr("height", layer_height)
        .attr("fill", i => layer_colors(i));

    g_completion_plot
        .append("g")
        .selectAll()
        .data(wells)
        .enter()
        .append("g")
        .attr(
            "transform",
            (well, i) => `translate(${horizontal_offset_wells(i)}, 0)`
        )
        .selectAll()
        .data(d3.range(number_layers))
        .enter()
        .append("line")
        .attr("y1", i => layer2pixels(i))
        .attr("y2", i => layer2pixels(i) + layer_height)
        .attr("stroke", "black");
}

export default render_completion;
