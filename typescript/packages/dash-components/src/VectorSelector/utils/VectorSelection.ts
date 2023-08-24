/**
 * Copyright (c) 2021- Equinor ASA
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { TreeData } from "@webviz/core-components";
import { TreeNodeSelection } from "@webviz/core-components";
import { MatchType } from "@webviz/core-components/dist/components/SmartNodeSelector/";

export default class VectorSelection extends TreeNodeSelection {
    private myTreeData: TreeData;

    constructor(argumentObject: {
        focussedLevel: number;
        nodePath: Array<string>;
        selected: boolean;
        delimiter: string;
        numMetaNodes: number;
        treeData: TreeData;
        caseInsensitiveMatching: boolean;
        allowOrOperator: boolean;
    }) {
        super(argumentObject);
        this.myTreeData = argumentObject.treeData;
    }

    setNodeName(data: string, index?: number): void {
        let increment = false;
        const newData = data;
        if (
            data === "" &&
            index === super.countLevel() - 1 &&
            ((index !== undefined && index === super.getNumMetaNodes()) ||
                (index === undefined &&
                    super.getFocussedLevel() === super.getNumMetaNodes()))
        ) {
            super.setNodeName(data, index || super.getFocussedLevel());
            super.decrementFocussedLevel();
            super.setNodeName("", (index || super.getFocussedLevel() + 1) - 1);
        } else {
            if (index !== undefined) {
                if (
                    index === super.getNumMetaNodes() - 1 &&
                    data.length === 1
                ) {
                    data = "*";
                    increment = true;
                }
                super.setNodeName(data, index);
            } else {
                if (
                    super.getFocussedLevel() === super.getNumMetaNodes() - 1 &&
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
    }

    incrementFocussedLevel(): boolean {
        const focussedLevel = super.getFocussedLevel();
        if (
            focussedLevel + 1 === super.getNumMetaNodes() - 1 &&
            super.countLevel() >= super.getNumMetaNodes()
        ) {
            super.setFocussedLevel(focussedLevel + 1);
        }
        return super.incrementFocussedLevel();
    }

    decrementFocussedLevel(): void {
        const focussedLevel = super.getFocussedLevel();
        if (focussedLevel - 1 === super.getNumMetaNodes() - 1) {
            if (super.getNodeName(focussedLevel) === "") {
                super.setNodeName("", super.getNumMetaNodes() - 1);
            }
            if (super.getNumMetaNodes() > 1) {
                this.setFocussedLevel(focussedLevel - 2, true);
            }
        } else {
            this.setFocussedLevel(focussedLevel - 1, true);
        }
        super.tidy();
    }

    setFocussedLevel(index: number, includeMetaData = true): void {
        if (!includeMetaData) {
            if (index === 0) {
                index = super.getNumMetaNodes();
            } else {
                index = super.getNumMetaNodes() + index;
            }
        } else {
            if (index === super.getNumMetaNodes() - 1) {
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
        const reg = RegExp(
            `^(([^${super.delimiter}\\|]+\\|)+([^${super.delimiter}\\|]+){1})$`
        );
        let level = 0;
        for (const el of this.getNodePath()) {
            if (
                (el.includes("?") ||
                    el.includes("*") ||
                    (super.allowOrOperator && reg.test(el))) &&
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
            MatchType.fullMatch
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
            caseInsensitiveMatching: super.caseInsensitiveMatching,
            allowOrOperator: super.allowOrOperator,
        });
    }
}
