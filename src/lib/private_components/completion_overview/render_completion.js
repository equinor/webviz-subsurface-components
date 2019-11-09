import * as d3 from "d3";
import Slider from "../shared/slider";

class CompletionOverviewD3 {
    constructor(container, layers, data, height) {
        this.container = container;
        this.layers = layers;
        this.data = data;
        this.height = height;

        this.render_completion();
    }

    render_completion() {
        const SPACE_LABEL_PLOT = 5; // Space between labels and plot, in pixels

        const dates = Object.keys(this.data).sort();
        const wells = [
            ...new Set(
                Object.keys(this.data)
                    .flatMap(date => Object.keys(this.data[date]))
                    .sort()
            ),
        ];

        const parent = d3.select("#" + this.container);

        const width = parent.node().offsetWidth;

        const svg = parent
            .append("svg")
            .style("overflow", "visible")
            .attr("width", width)
            .attr("height", this.height);

        const sliderContainer = svg.append("g");

        const iterationPicker = new Slider({
            parentElement: sliderContainer,
            data: dates,
            length: width,
            width: 80,
            position: {
                x: 50,
                y: 40,
            },
            numberOfVisibleTicks: 0,
        });

        //this.iterationPicker.on("change", index => {
        //    this._setIteration(index);
        //});

        iterationPicker.render();

        const width_layer_labels = calculate_label_bbox(svg, this.layers).width;
        const height_well_labels = calculate_label_bbox(svg, wells, 90).height;

        const width_completion_plot =
            width - width_layer_labels - SPACE_LABEL_PLOT;
        const height_completion_plot =
            this.height - height_well_labels - SPACE_LABEL_PLOT;

        const number_layers = this.layers.length;
        const layer_colors = d3
            .scaleOrdinal()
            .domain(d3.range(number_layers))
            .range(d3.schemePastel1);

        const layer2pixels = d3
            .scaleLinear()
            .domain([0, number_layers])
            .range([0, height_completion_plot]);
        const layer_height = layer2pixels(1) - layer2pixels(0);

        const g_layer_labels = svg.append("g");

        g_layer_labels
            .selectAll()
            .data(d3.range(number_layers))
            .enter()
            .append("text")
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "end")
            .attr(
                "y",
                d =>
                    height_well_labels +
                    SPACE_LABEL_PLOT +
                    layer2pixels(d) +
                    0.5 * layer_height
            )
            .text(d => this.layers[d]);

        g_layer_labels.attr("transform", `translate(${width_layer_labels}, 0)`);

        const horizontal_offset_wells = d3
            .scaleLinear()
            .domain([0, wells.length - 1])
            .range([0.1 * width_completion_plot, 0.9 * width_completion_plot]);

        const g_completion_plot = svg
            .append("g")
            .attr(
                "transform",
                `translate(${width_layer_labels +
                    SPACE_LABEL_PLOT}, ${height_well_labels +
                    SPACE_LABEL_PLOT})`
            );

        g_completion_plot
            .append("g")
            .selectAll()
            .data(d3.range(number_layers))
            .enter()
            .append("rect")
            .attr("y", i => layer2pixels(i))
            .attr("width", width_completion_plot)
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

        const g_well_labels = svg
            .append("g")
            .attr(
                "transform",
                `translate(${width_layer_labels + SPACE_LABEL_PLOT}, 0)`
            )
            .selectAll()
            .data(wells)
            .enter()
            .append("text")
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "central")
            .attr(
                "transform",
                (well, i) =>
                    `translate(${horizontal_offset_wells(i)}, 0) rotate(-90)`
            )
            .text(well => well);
    }

}

function calculate_label_bbox(svg, labels, rotation) {
    const g_text_to_remove = svg.append("g").style("visibility", "hidden");
    g_text_to_remove
        .selectAll()
        .data(labels)
        .enter()
        .append("text")
        .attr("transform", `rotate(${rotation ? rotation : 0})`)
        .text(label => label);

    const bbox = g_text_to_remove.node().getBBox();
    const result = { width: bbox.width, height: bbox.height };

    g_text_to_remove.remove();

    return result;
}

export default CompletionOverviewD3;
