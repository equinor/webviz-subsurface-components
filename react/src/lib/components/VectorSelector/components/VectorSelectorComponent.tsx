/**
 * Copyright (c) 2021- Equinor ASA
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import SmartNodeSelectorComponent from "@webviz/core-components/dist/components/SmartNodeSelector/components/SmartNodeSelectorComponent";
import TreeData from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeData";
import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";
import VectorSelection from "../utils/VectorSelection";
import VectorData from "../utils/VectorData";
import aquifer from "./images/aquifer.svg";
import block from "./images/block.svg";
import field from "./images/field.svg";
import group from "./images/group.svg";
import misc from "./images/misc.svg";
import network from "./images/network.svg";
import others from "./images/others.svg";
import region from "./images/region.svg";
import region_region from "./images/region-region.svg";
import segment from "./images/segment.svg";
import well from "./images/well.svg";
import well_completion from "./images/well-completion.svg";
import calculated from "./images/calculated.svg";

type ParentProps = {
    selectedTags: string[];
    selectedNodes: string[];
    selectedIds: string[];
};

type VectorDefinitions = {
    [key: string]: { type: string; description: string };
};

type VectorSelectorPropType = {
    id: string;
    maxNumSelectedNodes: number;
    delimiter: string;
    numMetaNodes: number;
    data: TreeDataNode[];
    label?: string;
    showSuggestions: boolean;
    setProps: (props: ParentProps) => void;
    selectedTags?: string[];
    placeholder?: string;
    numSecondsUntilSuggestionsAreShown: number;
    lineBreakAfterTag?: boolean;
    customVectorDefinitions?: VectorDefinitions;
    persistence: boolean | string | number;
    persisted_props: "selectedTags"[];
    persistence_type: "local" | "session" | "memory";
};

/**
 * SmartNodeSelector is a component that allows to create tags by selecting data from a tree structure.
 * The tree structure can also provide meta data that is displayed as color or icon.
 */
export default class VectorSelectorComponent extends SmartNodeSelectorComponent {
    public props: VectorSelectorPropType;
    protected vectorDefinitions: VectorDefinitions;

    constructor(props: VectorSelectorPropType) {
        super(props);
        this.props = props;

        this.vectorDefinitions = VectorData;
        if (props.customVectorDefinitions) {
            Object.keys(props.customVectorDefinitions).forEach(
                (vectorName: string) => {
                    if (vectorName in VectorData === false) {
                        this.vectorDefinitions[vectorName] = (
                            props.customVectorDefinitions as VectorDefinitions
                        )[vectorName];
                    }
                }
            );
        }

        let error: string | undefined;
        try {
            this.treeData = new TreeData({
                treeData: this.modifyTreeData(
                    props.data,
                    props.numMetaNodes,
                    this.vectorDefinitions
                ),
                delimiter: props.delimiter,
            });
        } catch (e: any) {
            error = e.toString();
        }

        const nodeSelections: VectorSelection[] = [];
        if (props.selectedTags !== undefined) {
            for (const tag of props.selectedTags) {
                const nodePath = tag.split(this.props.delimiter);
                nodePath.splice(props.numMetaNodes, 0, "*");
                nodeSelections.push(this.createNewNodeSelection(nodePath));
            }
        }
        if (
            nodeSelections.length < props.maxNumSelectedNodes ||
            props.maxNumSelectedNodes === -1
        ) {
            nodeSelections.push(this.createNewNodeSelection());
        }

        this.state = {
            nodeSelections,
            currentTagIndex: 0,
            suggestionsVisible: false,
            hasError: error !== undefined,
            error: error || "",
        };
    }

    componentDidUpdate(prevProps: VectorSelectorPropType): void {
        if (
            (this.props.data &&
                JSON.stringify(this.props.data) !==
                    JSON.stringify(prevProps.data)) ||
            (this.props.delimiter &&
                this.props.delimiter !== prevProps.delimiter) ||
            (this.props.numMetaNodes &&
                this.props.numMetaNodes !== prevProps.numMetaNodes)
        ) {
            let error: string | undefined;
            try {
                this.treeData = new TreeData({
                    treeData: this.modifyTreeData(
                        this.props.data,
                        this.props.numMetaNodes,
                        this.vectorDefinitions
                    ),
                    delimiter: this.props.delimiter,
                });
            } catch (e: any) {
                this.treeData = null;
                error = e.toString();
            }
            const nodeSelections: VectorSelection[] = [];
            for (const node of this.state.nodeSelections) {
                nodeSelections.push(
                    this.createNewNodeSelection(node.getNodePath())
                );
            }

            this.setState(
                {
                    nodeSelections: nodeSelections,
                    currentTagIndex: this.state.currentTagIndex,
                    suggestionsVisible: this.state.suggestionsVisible,
                    hasError: error !== undefined,
                    error: error || "",
                },
                () => {
                    this.updateSelectedTagsAndNodes();
                }
            );
        }

        const selectedTags = this.state.nodeSelections
            .filter((nodeSelection) => nodeSelection.isValid())
            .map((nodeSelection) =>
                nodeSelection.getCompleteNodePathAsString()
            );
        if (
            this.props.selectedTags &&
            JSON.stringify(this.props.selectedTags) !==
                JSON.stringify(selectedTags) &&
            JSON.stringify(prevProps.selectedTags) !==
                JSON.stringify(this.props.selectedTags)
        ) {
            const nodeSelections: VectorSelection[] = [];
            if (this.props.selectedTags !== undefined) {
                for (const tag of this.props.selectedTags) {
                    const nodePath = tag.split(this.props.delimiter);
                    nodePath.splice(this.props.numMetaNodes, 0, "*");
                    nodeSelections.push(this.createNewNodeSelection(nodePath));
                }
            }
            if (
                nodeSelections.length < this.props.maxNumSelectedNodes ||
                this.props.maxNumSelectedNodes === -1
            ) {
                nodeSelections.push(this.createNewNodeSelection());
            }
            this.numValidSelections = this.countValidSelections();
            this.updateState({ nodeSelections: nodeSelections });
        }
    }

    createNewNodeSelection(nodePath: string[] = [""]): VectorSelection {
        return new VectorSelection({
            focussedLevel: nodePath.length - 1,
            nodePath: nodePath,
            selected: false,
            delimiter: this.props.delimiter,
            numMetaNodes: this.props.numMetaNodes + 1,
            treeData: this.treeData as TreeData,
        });
    }

    modifyTreeData(
        treeData: TreeDataNode[],
        numMetaNodes: number,
        vectorDefinitions: VectorDefinitions
    ): TreeDataNode[] {
        const typeIcons: Record<string, string> = {
            aquifer: aquifer,
            block: block,
            calculated: calculated,
            field: field,
            group: group,
            misc: misc,
            network: network,
            others: others,
            region: region,
            "region-region": region_region,
            segment: segment,
            well: well,
            "well-completion": well_completion,
        };
        const populateData = (
            data: TreeDataNode[] | undefined,
            level: number
        ) => {
            const newData: TreeDataNode[] = [];
            if (level === numMetaNodes && data) {
                const types: Record<string, Array<TreeDataNode>> = {};
                for (let i = 0; i < data.length; i++) {
                    let type = "others";
                    if (data[i].name in vectorDefinitions) {
                        const asKey = data[i]
                            .name as keyof typeof vectorDefinitions;
                        type = vectorDefinitions[asKey].type;
                    }
                    if (!(type in types)) {
                        types[type] = [];
                    }
                    types[type].push(data[i]);
                }
                for (const type in types) {
                    newData.push({
                        name: type.charAt(0).toUpperCase() + type.slice(1),
                        description: vectorDefinitions[type]
                            ? vectorDefinitions[type].description
                            : "",
                        icon: typeIcons[type],
                        children: types[type],
                    });
                }
            } else if (data) {
                for (let i = 0; i < data.length; i++) {
                    newData.push({
                        name: data[i].name,
                        description: data[i].description || "",
                        color: data[i].color,
                        children: populateData(data[i].children, level + 1),
                    });
                }
            }
            return newData;
        };

        return populateData(treeData, 0);
    }

    handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
        super.handleInputChange(e);
        this.noUserInputSelect = true;
    }
}
