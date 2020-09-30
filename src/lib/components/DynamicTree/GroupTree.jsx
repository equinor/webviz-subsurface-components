import * as d3 from 'd3'

import Slider from '../../shared/slider'
import GroupTree from './group_tree'
import "./dynamic_tree.css";

/**
 * Creates a new instance of the group tree visualization with the necessary control components.
 *
 * The input data json format is as follows. For example data, see unit tests.
 *
 *   group-tree-data : { "iteration_names": {[]string},
 *            "iterations": {Object.<string,iteration >}}
 *
 *   iteration : { "timesteps": {[]string},
 *                 "trees": {Object.<string,node>}}
 *
 *   node : { "children": {[]child]},
 *            "gasrate": {int},
 *            "grupnet": {string},
 *            "name": {string},
 *            "oilrate": {int},
 *            "pressure": {int},
 *            "waterrate": {int}}
 *
 * @param {group-tree-data} data - the grouptree-datastructure serialized as json
 * @param sliderDomId - DOM id for the slider component.
 * @param iterationDomId- DOM id for the iteration selector.
 * @param flowDomId - DOM id for the flow rate selector.
 * @param gtDomId -- DOM id for the group tree svg element.
 */

 /*

<div id="grouptree_controls">
    <div id="{{element.containerId}}iteration_select"></div>
    <div id="{{element.containerId}}flowrate_select"></div>
    <div id="{{element.containerId}}grouptree_slider"></div>
</div>

<div id="{{element.containerId}}grouptree_tree"></div>

<script>
    webviz_petech.initDynamicTree(
        {'iterations': {{element.get_json_dump('iterations')}},
         'iteration_names': {{element.get_json_dump('iteration_names')}} },
        "#{{element.containerId}}grouptree_slider",
        "#{{element.containerId}}iteration_select",
        "#{{element.containerId}}flowrate_select",
        "#{{element.containerId}}grouptree_tree");
</script>

 */

export function initDynamicTree(
    data,
    sliderDomId,
    iterationDomId,
    flowDomId,
    gtDomId,
) {
    if (Object.keys(data).length > 0) {
        const groupTree = new GroupTree(gtDomId, data, 'oilrate')

        function SetupControls(groupTree, sliderDomId, iterationDomId, flowDomId) {
            const iteration_names = groupTree.data.iteration_names
            let currentTimestep = groupTree.data.iterations[iteration_names[0]].timesteps[0]
            let currentIteration = groupTree.data.iterations[iteration_names[0]]

            function setCurrentIteration(en) {
                currentIteration = groupTree.data.iterations[en]
                sliderControl.setData(
                    currentIteration
                        .timesteps
                        .sort()
                        .map(d => (new Date(d))
                            .toLocaleDateString()),
                )
                groupTree.update(currentIteration.trees[currentTimestep])
            }

            function setCurrentTimestep(ts) {
                currentTimestep = currentIteration.timesteps[ts]
                groupTree.update(currentIteration.trees[currentTimestep])
            }

            function setCurrentFlowrate(fr) {
                groupTree.flowrate = fr
            }

            function populateRatioBtns(names, domId, input_name, selectedCallback) {
                const lables = d3.select(domId).selectAll('label')
                    .data(names).enter()
                    .append('label')
                    .attr('class', 'radio-inline')

                lables.append('input')
                    .attr('type', 'radio')
                    .attr('value', (d) => d)
                    .attr('name', input_name)
                    .on('click', (d) => selectedCallback(d))

                lables.append('text').text((d) => d)

                d3.select(domId).select('label').select('input').attr('checked', true)
            }

            populateRatioBtns(groupTree.data.iteration_names,
                iterationDomId,
                'iteration',
                setCurrentIteration)

            populateRatioBtns(['oilrate', 'waterrate', 'gasrate'],
                flowDomId,
                'flow',
                setCurrentFlowrate)

            let sliderControl = new Slider({
                parentElement: d3.select(sliderDomId).append('svg')
                    .attr('height', 80)
                    .attr('width', 1000),
                orientation: 'HORIZONTAL',
                length: 900,
                width: 80,
                position: {
                    x: 40,
                    y: 40,
                },
                data: currentIteration
                    .timesteps
                    .sort()
                    .map(d => (new Date(d))
                        .toLocaleDateString()),
            })
            sliderControl.on('change', setCurrentTimestep)
            sliderControl.render()

            groupTree.update(currentIteration.trees[currentTimestep])
        }

        SetupControls(groupTree, sliderDomId, iterationDomId, flowDomId)
    } else {
        throw new Error('Empty dataset')
    }
}
