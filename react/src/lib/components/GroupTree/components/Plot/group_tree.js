/** This code is copied directly from
 * https://github.com/anders-kiaer/webviz-subsurface-components/blob/dynamic_tree/src/lib/components/DynamicTree/group_tree.js
 *  This needs to be refactored to develop further
 *
 * 9 july 2021: refactored to use new format.
 */
import * as d3 from "d3";
/* eslint camelcase: "off" */
/* eslint array-callback-return: "off" */
/* eslint no-return-assign: "off" */
/* eslint no-use-before-define: "off" */
/* eslint no-useless-concat: "off" */
/* Fix this lint when rewriting the whole file */

/**
 * Group tree visualization. Creates an _svg, and appends to the assigned element.
 * Draws the tree provided as tree_data

 * @constructor
 */
export default class GroupTree {
    /**
     *
     * @param dom_element_id
     * @param {group-tree-data} tree_data
     * @param defaultFlowrate
     */
    constructor(
        dom_element_id,
        tree_data,
        defaultFlowrate,
        defaultNodeInfo,
        currentDateTime,
        edge_options,
        node_options
    ) {
        // Add "#" if missing.
        if (dom_element_id.charAt(0) !== "#") {
            dom_element_id = "#" + dom_element_id;
        }

        // Map from property to [label/name, unit]
        const options = [...edge_options, ...node_options];
        this._propertyToLabelMap = new Map();
        options.forEach((key) => {
            this._propertyToLabelMap.set(key.name, [
                key.label ?? "",
                key.unit ?? "",
            ]);
        });

        // Represent possible empty data by single empty node.
        if (tree_data.length === 0) {
            currentDateTime = "";
            tree_data = [
                {
                    dates: [currentDateTime],
                    tree: {
                        node_label: "NO DATA",
                        edge_label: "NO DATA",
                        node_data: {},
                        edge_data: {},
                    },
                },
            ];
        }

        this._currentFlowrate = defaultFlowrate;
        this._currentNodeInfo = defaultNodeInfo;
        this._currentDateTime = currentDateTime;

        this._transitionTime = 200;

        const tree_values = {};

        tree_data.map((datedTree) => {
            let tree = datedTree.tree;
            d3.hierarchy(tree, (d) => d.children).each((node) => {
                // edge_data
                Object.keys(node.data.edge_data).forEach((key) => {
                    if (!tree_values[key]) {
                        tree_values[key] = [];
                    }
                    tree_values[key].push(node.data.edge_data[key]);
                });
            });
        });

        this._path_scale = new Map();
        Object.keys(tree_values).forEach((key) => {
            const extent = [0, d3.max(tree_values[key].flat())];
            this._path_scale[key] = d3
                .scaleLinear()
                .domain(extent)
                .range([2, 100]);
        });

        const select = d3.select(dom_element_id);
        this._width = select.node().getBoundingClientRect().width;

        const margin = {
            top: 10,
            right: 90,
            bottom: 30,
            left: 90,
        };

        const height = 700 - margin.top - margin.bottom;
        this._width = this._width - margin.left - margin.right;

        // Clear possible existing svg's.
        d3.select(dom_element_id).selectAll("svg").remove();

        this._svg = d3
            .select(dom_element_id)
            .append("svg")
            .attr("width", this._width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        this._textpaths = this._svg.append("g");

        this._renderTree = d3.tree().size([height, this._width]);

        this._data = GroupTree.initHierarchies(tree_data, height);

        this._currentTree = {};

        this.update(currentDateTime);
    }

    /**
     * Initialize all trees in the group tree datastructure, once for the entire visualization.
     *
     */
    static initHierarchies(tree_data, height) {
        // generate the node-id used to match in the enter, update and exit selections
        const getId = (d) =>
            d.parent === null
                ? d.data.node_label
                : `${d.parent.id}_${d.data.node_label}`;

        tree_data.map((datedTree) => {
            let tree = datedTree.tree;
            tree = d3.hierarchy(tree, (dd) => dd.children);
            tree.descendants().map((n) => (n.id = getId(n)));
            tree.x0 = height / 2;
            tree.y0 = 0;
            datedTree.tree = tree;
        });

        return tree_data;
    }

    /**
     * @returns {*} -The initialized hierarchical group tree data structure
     */
    get data() {
        return this._data;
    }

    /**
     * Set the flowrate and update display of all edges accordingly.
     *
     * @param flowrate - key identifying the flowrate of the incoming edge
     */
    set flowrate(flowrate) {
        this._currentFlowrate = flowrate;

        const current_tree_index = this._data.findIndex((e) => {
            return e.dates.includes(this._currentDateTime);
        });

        const date_index = this._data[current_tree_index].dates.indexOf(
            this._currentDateTime
        );

        this._svg
            .selectAll("path.link")
            .transition()
            .duration(this._transitionTime)
            .attr(
                "class",
                () => `link grouptree_link grouptree_link__${flowrate}`
            )
            .style("stroke-width", (d) =>
                this.getEdgeStrokeWidth(
                    flowrate,
                    d.data.edge_data[flowrate]?.[date_index] ?? 0
                )
            )
            .style("stroke-dasharray", (d) => {
                return (d.data.edge_data[flowrate]?.[date_index] ?? 0) > 0
                    ? "none"
                    : "5,5";
            });
    }

    get flowrate() {
        return this._currentFlowrate;
    }

    set nodeinfo(nodeinfo) {
        this._currentNodeInfo = nodeinfo;

        const current_tree_index = this._data.findIndex((e) => {
            return e.dates.includes(this._currentDateTime);
        });

        const date_index = this._data[current_tree_index].dates.indexOf(
            this._currentDateTime
        );

        this._svg
            .selectAll(".grouptree__pressurelabel")
            .text(
                (d) =>
                    d.data.node_data?.[nodeinfo]?.[date_index]?.toFixed(0) ??
                    "NA"
            );

        this._svg.selectAll(".grouptree__pressureunit").text(() => {
            const t = this._propertyToLabelMap.get(nodeinfo) ?? ["", ""];
            return t[1];
        });
    }

    get nodeinfo() {
        return this._currentNodeInfo;
    }

    getEdgeStrokeWidth(key, val) {
        const normalized =
            this._path_scale[key] !== undefined
                ? this._path_scale[key](val ?? 0)
                : 2;
        return `${normalized}px`;
    }

    /**
     * Sets the state of the current tree, and updates the tree visualization accordingly.
     * The state is changed either due to a branch open/close, or that the tree is entirely changed
     * when moving back and fourth in time.
     *
     * @param root
     */
    update(newDateTime) {
        const self = this;

        self._currentDateTime = newDateTime;

        const new_tree_index = self._data.findIndex((e) => {
            return e.dates.includes(newDateTime);
        });

        const root = self._data[new_tree_index];

        const date_index = root.dates.indexOf(self._currentDateTime);

        /**
         * Assigns y coordinates to all tree nodes in the rendered tree.
         * @param t - a rendered tree
         * @param {int} width - the
         * @returns a rendered tree width coordinates for all nodes.
         */
        function growNewTree(t, width) {
            t.descendants().forEach((d) => {
                d.y = (d.depth * width) / (t.height + 1);
            });

            return t;
        }

        function doPostUpdateOperations(tree) {
            setEndPositions(tree.descendants());
            setNodeVisibility(tree.descendants(), true);
            return tree;
        }

        function findClosestVisibleParent(d) {
            let c = d;
            while (c.parent && !c.isvisible) {
                c = c.parent;
            }
            return c;
        }

        function getClosestVisibleParentStartCoordinates(d) {
            const p = findClosestVisibleParent(d);
            return { x: p.x0 ?? 0, y: p.y0 ?? 0 };
        }

        function getClosestVisibleParentEndCoordinates(d) {
            const p = findClosestVisibleParent(d);
            return { x: p.x, y: p.y };
        }

        /**
         * Implicitly alter the state of a node, by hiding its children
         * @param node
         */
        function toggleBranch(node) {
            if (node.children) {
                node._children = node.children;
                node.children = null;
            } else {
                node.children = node._children;
                node._children = null;
            }

            self.update(self._currentDateTime);
        }

        /**
         * Toggles visibility of a node. This state determines if the node, and its children
         * @param nodes
         * @param visibility
         */
        function setNodeVisibility(nodes, visibility) {
            nodes.forEach((d) => {
                d.isvisible = visibility;
            });
        }

        /**
         * After node translation transition, save end position
         * @param nodes
         */
        function setEndPositions(nodes) {
            nodes.forEach((d) => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        function getToolTipText(data, date_index) {
            if (data === undefined || date_index === undefined) {
                return "";
            }

            const propNames = Object.keys(data);
            let text = "";
            propNames.forEach(function (s) {
                const t = self._propertyToLabelMap.get(s) ?? [s, ""];
                const pre = t[0];
                const unit = t[1];
                text +=
                    pre +
                    " " +
                    (data[s]?.[date_index]?.toFixed(0) ?? "") +
                    " " +
                    unit +
                    "\n";
            });
            return text;
        }

        /**
         * Clone old node start position to new node start position.
         * Clone new node end position to old node end position.
         * Clone old visibility to new.
         *
         * @param newRoot
         * @param oldRoot
         */
        function cloneExistingNodeStates(newRoot, oldRoot) {
            if (Object.keys(oldRoot).length > 0) {
                oldRoot.descendants().forEach((oldNode) => {
                    newRoot.descendants().forEach((newNode) => {
                        if (oldNode.id === newNode.id) {
                            newNode.x0 = oldNode.x0;
                            newNode.y0 = oldNode.y0;

                            oldNode.x = newNode.x;
                            oldNode.y = newNode.y;

                            newNode.isvisible = oldNode.isvisible;
                        }
                    });
                });
            }
            return newRoot;
        }

        /**
         * Merge the existing tree, with nodes from a new tree.
         * New nodes fold out from the closest visible parent.
         * Old nodes are removed.
         *
         * @param nodes - list of nodes in a tree
         */
        function updateNodes(nodes, nodeinfo) {
            const node = self._svg.selectAll("g.node").data(nodes, (d) => d.id);

            const nodeEnter = node
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("id", (d) => d.id)
                .attr("transform", (d) => {
                    const c = getClosestVisibleParentStartCoordinates(d);
                    return `translate(${c.y},${c.x})`;
                })
                .on("click", toggleBranch);

            nodeEnter
                .append("circle")
                .attr("id", (d) => d.id)
                .attr("r", 6)
                .transition()
                .duration(self._transitionTime)
                .attr("x", (d) => d.x)
                .attr("y", (d) => d.y);

            nodeEnter
                .append("text")
                .attr("class", "grouptree__nodelabel")
                .attr("dy", ".35em")
                .style("fill-opacity", 1)
                .attr("x", (d) => (d.children || d._children ? -21 : 21))
                .attr("text-anchor", (d) =>
                    d.children || d._children ? "end" : "start"
                )
                .text((d) => d.data.node_label);

            nodeEnter
                .append("text")
                .attr("class", "grouptree__pressurelabel")
                .attr("x", 0)
                .attr("dy", "-.05em")
                .attr("text-anchor", "middle")
                .text(
                    (d) =>
                        d.data.node_data[nodeinfo]?.[date_index]?.toFixed(0) ??
                        "NA"
                );

            nodeEnter
                .append("text")
                .attr("class", "grouptree__pressureunit")
                .attr("x", 0)
                .attr("dy", ".04em")
                .attr("dominant-baseline", "text-before-edge")
                .attr("text-anchor", "middle")
                .text(() => {
                    const t = self._propertyToLabelMap.get(nodeinfo) ?? [
                        "",
                        "",
                    ];
                    return t[1];
                });

            nodeEnter
                .append("title")
                .text((d) => getToolTipText(d.data.node_data, date_index));

            const nodeUpdate = nodeEnter.merge(node);

            // Nodes from earlier exit selection may reenter if transition is interupted. Restore state.
            nodeUpdate
                .filter(".exiting")
                .interrupt()
                .classed("exiting", false)
                .attr("opacity", 1);

            nodeUpdate
                .select("text.grouptree__pressurelabel")
                .text(
                    (d) =>
                        d.data.node_data[nodeinfo]?.[date_index]?.toFixed(0) ??
                        "NA"
                );

            nodeUpdate
                .transition()
                .duration(self._transitionTime)
                .attr("transform", (d) => `translate(${d.y},${d.x})`);

            nodeUpdate
                .select("circle")
                .attr(
                    "class",
                    (d) =>
                        `${"grouptree__node" + " "}${
                            d.children || d._children
                                ? "grouptree__node--withchildren"
                                : "grouptree__node"
                        }`
                )
                .transition()
                .duration(self._transitionTime)
                .attr("r", 15);

            nodeUpdate
                .select("title")
                .text((d) => getToolTipText(d.data.node_data, date_index));

            node.exit()
                .classed("exiting", true)
                .attr("opacity", 1)
                .transition()
                .duration(self._transitionTime)
                .attr("opacity", 1e-6)
                .attr("transform", (d) => {
                    d.isvisible = false;
                    const c = getClosestVisibleParentEndCoordinates(d);
                    return `translate(${c.y},${c.x})`;
                })
                .remove();
        }

        /**
         * Draw new edges, and update existing ones.
         *
         * @param edges -list of nodes in a tree
         * @param flowrate - key identifying the flowrate of the incoming edge
         */
        function updateEdges(edges, flowrate) {
            const link = self._svg
                .selectAll("path.link")
                .data(edges, (d) => d.id);

            const linkEnter = link
                .enter()
                .insert("path", "g")
                .attr("id", (d) => `path ${d.id}`)
                .attr("d", (d) => {
                    const c = getClosestVisibleParentStartCoordinates(d);
                    return diagonal(c, c);
                });

            linkEnter
                .append("title")
                .text((d) => getToolTipText(d.data.edge_data, date_index));

            const linkUpdate = linkEnter.merge(link);

            linkUpdate
                .attr(
                    "class",
                    () => `link grouptree_link grouptree_link__${flowrate}`
                )
                .transition()
                .duration(self._transitionTime)
                .attr("d", (d) => diagonal(d, d.parent))
                .style("stroke-width", (d) =>
                    self.getEdgeStrokeWidth(
                        flowrate,
                        d.data.edge_data[flowrate]?.[date_index] ?? 0
                    )
                )
                .style("stroke-dasharray", (d) => {
                    return (d.data.edge_data[flowrate]?.[date_index] ?? 0) > 0
                        ? "none"
                        : "5,5";
                });

            linkUpdate
                .select("title")
                .text((d) => getToolTipText(d.data.edge_data, date_index));

            link.exit()
                .transition()
                .duration(self._transitionTime)
                .attr("d", (d) => {
                    d.isvisible = false;
                    const c = getClosestVisibleParentEndCoordinates(d);
                    return diagonal(c, c);
                })
                .remove();

            /**
             * Create the curve definition for the edge between node s and node d.
             * @param s - source node
             * @param d - destination node
             */
            function diagonal(s, d) {
                return `M ${d.y} ${d.x}
                 C ${(d.y + s.y) / 2} ${d.x},
                   ${(d.y + s.y) / 2} ${s.x},
                   ${s.y} ${s.x}`;
            }
        }

        /**
         * Add new and update existing texts/textpaths on edges.
         *
         * @param edges - list of nodes in a tree
         */
        function updateEdgeTexts(edges) {
            const textpath = self._textpaths
                .selectAll(".edge_info_text")
                .data(edges, (d) => d.id);

            const enter = textpath
                .enter()
                .insert("text")
                .attr("dominant-baseline", "central")
                .attr("text-anchor", "middle")
                .append("textPath")
                .attr("class", "edge_info_text")
                .attr("startOffset", "50%")
                .attr("xlink:href", (d) => `#path ${d.id}`);

            enter
                .merge(textpath)
                .attr("fill-opacity", 1e-6)
                .transition()
                .duration(self._transitionTime)
                .attr("fill-opacity", 1)
                .text((d) => d.data.edge_label);

            textpath.exit().remove();
        }

        const newTree = cloneExistingNodeStates(
            growNewTree(this._renderTree(root.tree), this._width),
            this._currentTree
        );

        // execute visualization operations on enter, update and exit selections
        updateNodes(newTree.descendants(), this.nodeinfo);
        updateEdges(newTree.descendants().slice(1), this.flowrate);
        updateEdgeTexts(newTree.descendants().slice(1));

        // save the state of the now current tree, before next update
        this._currentTree = doPostUpdateOperations(newTree);
    }
}
