/**
 * Copyright (c) 2021- Equinor ASA
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import TreeNodeSelection from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeNodeSelection";
import TreeData from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeData";

export default class VectorSelection extends TreeNodeSelection {
    private myTreeData: TreeData;

    constructor(argumentObject: {
        focussedLevel: number;
        nodePath: Array<string>;
        selected: boolean;
        delimiter: string;
        numMetaNodes: number;
        treeData: TreeData;
    }) {
        super(argumentObject);
        this.myTreeData = argumentObject.treeData;
    }

    setNodeName(data: string, index?: number): void {
        let increment = false;
        const newData = data;
        if (index !== undefined) {
            if (index == super.getNumMetaNodes() - 1 && data.length == 1) {
                data = "*";
                increment = true;
            }
            super.setNodeName(data, index);
        } else {
            if (
                super.getFocussedLevel() == super.getNumMetaNodes() - 1 &&
                data.length == 1
            ) {
                data = "*";
                increment = true;
            }
            super.setNodeName(data, super.getFocussedLevel());
        }
        if (increment) {
            super.incrementFocussedLevel();
            super.setNodeName(newData, super.getFocussedLevel());
        }
    }

    decrementFocussedLevel(): void {
        const focussedLevel = super.getFocussedLevel();
        this.setFocussedLevel(focussedLevel - 1, true);
        if (focussedLevel - 1 == super.getNumMetaNodes() - 1) {
            this.setNodeName("");
        }
    }

    setFocussedLevel(index: number, includeMetaData = true): void {
        if (!includeMetaData) {
            if (index == 0) {
                index = super.getNumMetaNodes();
            } else {
                index = super.getNumMetaNodes() + index;
            }
        } else {
            if (index == super.getNumMetaNodes() - 1) {
                index = super.getNumMetaNodes() - 1;
            }
        }
        super.setFocussedLevel(index, true);
    }

    containsOrIsContainedBy(other: VectorSelection): boolean {
        if (
            this.containsWildcardIncludingType() &&
            !other.containsWildcardIncludingType()
        ) {
            return this.exactlyMatchedNodePaths().includes(
                other.getCompleteNodePathAsString()
            );
        } else if (
            !this.containsWildcardIncludingType() &&
            other.containsWildcardIncludingType()
        ) {
            return other
                .exactlyMatchedNodePaths()
                .includes(this.getCompleteNodePathAsString());
        } else if (
            this.containsWildcardIncludingType() &&
            other.containsWildcardIncludingType()
        ) {
            const otherMatchedTags = other.exactlyMatchedNodePaths();
            return this.exactlyMatchedNodePaths().some((el) =>
                otherMatchedTags.includes(el)
            );
        } else {
            return this.equals(other);
        }
    }

    containsWildcardIncludingType(): boolean {
        return super.containsWildcard();
    }

    containsWildcard(): boolean {
        let level = 0;
        for (const el of this.getNodePath()) {
            if (
                (el.includes("?") || el.includes("*")) &&
                level != super.getNumMetaNodes() - 1
            ) {
                return true;
            }
            level++;
        }
        return false;
    }

    getCompleteNodePathAsString(): string {
        const result: string[] = [];
        for (let i = 0; i < this.countLevel(); i++) {
            if (i != super.getNumMetaNodes() - 1) {
                result.push(this.getNodeName(i) as string);
            }
        }
        return result.join(super.getDelimiter());
    }

    exactlyMatchedNodePaths(): Array<string> {
        const selections = this.myTreeData.findNodes(
            super.getNodePath(),
            true
        ).nodePaths;
        const nodePaths: string[] = [];
        for (const selection of selections) {
            const split = selection.split(super.getDelimiter());
            split.splice(super.getNumMetaNodes() - 1, 1);
            nodePaths.push(split.join(super.getDelimiter()));
        }
        return nodePaths;
    }

    clone(): VectorSelection {
        return new VectorSelection({
            focussedLevel: this.getFocussedLevel(),
            nodePath: this.getNodePath() as Array<string>,
            selected: false,
            delimiter: super.getDelimiter(),
            numMetaNodes: super.getNumMetaNodes(),
            treeData: this.myTreeData,
        });
    }
}
