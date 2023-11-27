/**
 * Class to assemble Group tree visualization. Creates an _svg, and appends to the
 * assigned HTML element. Draws the tree provided as tree_data with the current flow rate,
 * node info and date time.
 *
 * Provides methods to update selected date time, and change flow rate and node info. *
 */
export default class GroupTreeAssembler {
    /**
     * Initialize all trees in the group tree datastructure, once for the entire visualization.
     *
     */
    static initHierarchies(tree_data: any, height: any): any;
    /**
     *
     * @param dom_element_id - id of the HTML element to append the _svg to
     * @param {DatedTrees} datedTrees - List of dated tree data structure containing the trees to visualize
     * @param initialFlowRate - key identifying the initial selected flow rate for the tree edges
     * @param initialNodeInfo - key identifying the initial selected node info for the tree nodes
     * @param currentDateTime - the initial/current date time
     * @param edgeMetadataList - List of metadata for the edge keys in the tree data structure
     * @param nodeMetadataList - List of metadata for the node keys in the tree data structure
     */
    constructor(dom_element_id: any, datedTrees: DatedTrees, initialFlowRate: any, initialNodeInfo: any, currentDateTime: any, edgeMetadataList: any, nodeMetadataList: any);
    _propertyToLabelMap: Map<any, any>;
    _currentFlowRate: any;
    _currentNodeInfo: any;
    _currentDateTime: any;
    _transitionTime: number;
    _path_scale: Map<any, any>;
    _width: number;
    _svg: d3.Selection<SVGGElement, any, null, undefined>;
    _textpaths: d3.Selection<SVGGElement, any, null, undefined>;
    _renderTree: d3.TreeLayout<any>;
    _data: any;
    _currentTree: {};
    /**
     * @returns {*} -The initialized hierarchical group tree data structure
     */
    get data(): any;
    /**
     * Set the flowrate and update display of all edges accordingly.
     *
     * @param flowrate - key identifying the flowrate of the incoming edge
     */
    set flowrate(arg: any);
    get flowrate(): any;
    set nodeinfo(arg: any);
    get nodeinfo(): any;
    getEdgeStrokeWidth(key: any, val: any): string;
    /**
     * Sets the state of the current tree, and updates the tree visualization accordingly.
     * The state is changed either due to a branch open/close, or that the tree is entirely changed
     * when moving back and fourth in time.
     *
     * @param root
     */
    update(newDateTime: any): void;
}
import * as d3 from "d3";
