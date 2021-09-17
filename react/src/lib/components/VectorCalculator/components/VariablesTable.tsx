import React from "react";
import {
    Paper,
    Table,
    TableContainer,
    TableRow,
    TableBody,
    TableCell,
} from "@material-ui/core";
import { TreeDataNode } from "@webviz/core-components/dist/components/SmartNodeSelector/utils/TreeDataNodeTypes";
import cloneDeep from "lodash/cloneDeep";

import { VariableVectorMapType } from "../utils/VectorCalculatorTypes";
import VectorSelector from "../../VectorSelector";

import "../VectorCalculator.css";

interface VariablesTableProps {
    variableVectorMap: VariableVectorMapType[];
    vectorData: TreeDataNode[];
    disabled?: boolean;
    onMapChange: (variableVectorMap: VariableVectorMapType[]) => void;
}

type VectorSelectorParentProps = {
    selectedTags: string[];
    selectedNodes: string[];
    selectedIds: string[];
};

export const VariablesTable: React.FC<VariablesTableProps> = (
    props: VariablesTableProps
) => {
    const { vectorData } = props;
    const disabled = props.disabled || false;

    const updateProps = React.useCallback(
        (
            vectorSelectorProps: VectorSelectorParentProps,
            index: number
        ): void => {
            const newVariableVectorMap = cloneDeep(props.variableVectorMap);
            if (vectorSelectorProps.selectedTags.length < 1) {
                newVariableVectorMap[index].vectorName = [];
            } else {
                newVariableVectorMap[index].vectorName[0] =
                    vectorSelectorProps.selectedTags[0];
            }
            props.onMapChange(newVariableVectorMap);
        },
        [props.variableVectorMap, props.onMapChange]
    );

    return (
        <TableContainer component={Paper} className="VariablesTableContainer">
            {disabled && <div className="DisableOverlay" />}
            <Table>
                <TableBody>
                    {props.variableVectorMap.map((row, index) => {
                        return (
                            <TableRow
                                tabIndex={-1}
                                key={"row_" + row.variableName}
                            >
                                <TableCell align="left" key={row.variableName}>
                                    {row.variableName}
                                </TableCell>
                                <TableCell key={`cell_${row.variableName}`}>
                                    <VectorSelector
                                        id={
                                            "vector_selector_" +
                                            row.variableName
                                        }
                                        key={
                                            "vector_selector_" +
                                            row.variableName
                                        }
                                        delimiter=":"
                                        label=""
                                        selectedTags={row.vectorName}
                                        setProps={(props) =>
                                            updateProps(props, index)
                                        }
                                        numMetaNodes={0}
                                        maxNumSelectedNodes={1}
                                        numSecondsUntilSuggestionsAreShown={0}
                                        placeholder="Select a vector"
                                        data={vectorData}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
