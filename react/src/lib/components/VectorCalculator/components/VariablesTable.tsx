import React from "react";
import {
    Paper,
    Table,
    TableContainer,
    TableRow,
    TableBody,
    TableCell,
} from "@material-ui/core";
import { TreeDataNode } from "@webviz/core-components";
import cloneDeep from "lodash/cloneDeep";

import { ExpressionStatus, StoreActions, useStore } from "./ExpressionsStore";
import { VariableVectorMapType } from "../utils/VectorCalculatorTypes";
import {
    createVariableVectorMapFromVariables,
    isVariableVectorMapValid,
} from "../utils/VectorCalculatorHelperFunctions";
import VectorSelector from "../../VectorSelector";

import { getExpressionParseData } from "../utils/ExpressionParser";

import "!style-loader!css-loader!../VectorCalculator.css";

interface VariablesTableProps {
    vectorData: TreeDataNode[];
    disabled?: boolean;
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
    const store = useStore();
    const [variableVectorMap, setVariableVectorMap] = React.useState<
        VariableVectorMapType[]
    >(store.state.editableVariableVectorMap);
    const disabled = props.disabled || false;

    const makeVariableVectorMapFromExpression = React.useCallback(
        (expression: string): VariableVectorMapType[] => {
            if (expression.length === 0) {
                return [];
            }

            const parseData = getExpressionParseData(expression);
            if (!parseData.isValid) {
                return cloneDeep(variableVectorMap);
            }
            return createVariableVectorMapFromVariables(
                parseData.variables,
                store.state.cachedVariableVectorMap
            );
        },
        [
            variableVectorMap,
            store.state.cachedVariableVectorMap,
            getExpressionParseData,
            createVariableVectorMapFromVariables,
        ]
    );

    React.useEffect(() => {
        setVariableVectorMap(store.state.editableVariableVectorMap);
    }, [store.state.editableVariableVectorMap]);

    React.useEffect(() => {
        if (store.state.externalParsing) {
            return;
        }
        if (store.state.editableExpressionStatus !== ExpressionStatus.Valid) {
            return;
        }

        const newVariableVectorMap = makeVariableVectorMapFromExpression(
            store.state.editableExpression
        );
        const mapStatus = isVariableVectorMapValid(
            newVariableVectorMap,
            ":",
            vectorData
        );
        store.dispatch({
            type: StoreActions.SetVariableVectorMap,
            payload: {
                variableVectorMap: newVariableVectorMap,
                status: mapStatus,
            },
        });
    }, [store.state.editableExpression, store.state.editableExpressionStatus]);

    const updateProps = React.useCallback(
        (
            vectorSelectorProps: VectorSelectorParentProps,
            index: number
        ): void => {
            const newVariableVectorMap = cloneDeep(variableVectorMap);
            if (vectorSelectorProps.selectedTags.length < 1) {
                newVariableVectorMap[index].vectorName = [];
            } else {
                newVariableVectorMap[index].vectorName[0] =
                    vectorSelectorProps.selectedTags[0];
            }

            const mapStatus = isVariableVectorMapValid(
                newVariableVectorMap,
                ":",
                vectorData
            );
            store.dispatch({
                type: StoreActions.SetVariableVectorMap,
                payload: {
                    variableVectorMap: newVariableVectorMap,
                    status: mapStatus,
                },
            });
        },
        [variableVectorMap]
    );

    return (
        <TableContainer component={Paper} className="VariablesTableContainer">
            {disabled && <div className="DisableOverlay" />}
            <Table>
                <TableBody>
                    {variableVectorMap.map((row, index) => {
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
                                        placeholder="Add new vector..."
                                        data={vectorData}
                                        caseInsensitiveMatching={true}
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
