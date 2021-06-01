import { ExpressionType, VariableVectorMapType } from '../utils/VectorCalculatorTypes';
import { TreeDataNode, TreeDataNodeMetaData } from '@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes'
import TreeData from '@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeData';

export const isExpressionNameExisting = (name: string, expressions: ExpressionType[]): boolean => {
    return expressions.some((expression) => expression.name === name);
}

export const getAvailableName = (nameSuggestion: string, expressions: ExpressionType[]): string => {
    let availableName = nameSuggestion;
    let n: number = 1;
    while (isExpressionNameExisting(availableName, expressions)) {
        availableName = `${nameSuggestion}_${n}`
        ++n;
    }
    return availableName;
}

export const isVariableVectorMapValid = (variableVectorMap: VariableVectorMapType[], delimiter: string, vectorData: TreeDataNode[]): boolean => {
    const vectorNames: (string | undefined)[] = variableVectorMap.map((pair) => { return pair.vectorName.length <= 0 ? undefined : pair.vectorName[0] });
    return allVectorNamesValid(vectorNames, delimiter, vectorData);
}

export const allVectorNamesValid = (names: (string | undefined)[], delimiter: string, vectorData: TreeDataNode[]): boolean => {
    return names.every(name => name === undefined ? false : isVectorNameValid(name, delimiter, vectorData));
}

export const isVectorNameValid = (name: string, delimiter: string, vectorData: TreeDataNode[]): boolean => {
    const nodePath: string[] = name.split(delimiter);
    const treeData = new TreeData({ treeData: vectorData, delimiter: delimiter });

    if (nodePath.length <= 0 || vectorData.length <= 0) {
        return false;
    }

    // Retrieve all meta data nodes in path
    const metaNodes: TreeDataNodeMetaData[] | null = treeData.findFirstNode(nodePath, true);

    return metaNodes !== null;
}
