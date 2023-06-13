/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
import {
    Table,
    TableContainer,
    TableRow,
    TableBody,
    TableCell,
} from "@mui/material";
import { TreeDataNode } from "@webviz/core-components";
import cloneDeep from "lodash/cloneDeep";

import VectorSelector from "../../../../VectorSelector";
import { StoreActions, useStore } from "../../ExpressionsStore";
import { VariableVectorMapType } from "../../../utils/VectorCalculatorTypes";
import {
    areVariableVectorMapsEqual,
    createVariableVectorMapFromVariables,
    isVariableVectorMapValid,
} from "../../../utils/VectorCalculatorHelperFunctions";

import "../../../VectorCalculator.css";

interface VectorSelectorTableProps {
    vectorData: TreeDataNode[];
    disabled?: boolean;
    onValidChanged: (isValid: boolean) => void;
}

type VectorSelectorParentProps = {
    selectedTags: string[];
    selectedNodes: string[];
    selectedIds: string[];
};

export const VectorSelectorTable: React.FC<VectorSelectorTableProps> = (
    props: VectorSelectorTableProps
) => {
    const store = useStore();
    const [isValid, setIsValid] = React.useState<boolean>(
        isVariableVectorMapValid(
            store.state.editableVariableVectorMap,
            ":",
            props.vectorData
        )
    );
    const [variableVectorMap, setVariableVectorMap] = React.useState<
        VariableVectorMapType[]
    >(store.state.editableVariableVectorMap);
    const [cachedVariableVectorMap, setCachedVariableVectorMap] =
        React.useState<VariableVectorMapType[]>(
            store.state.editableVariableVectorMap
        );

    const disabled = props.disabled || false;

    const createUpdatedCachedVariableVectorMap = React.useCallback(
        (newMap: VariableVectorMapType[]): VariableVectorMapType[] => {
            const newCachedVariableVectorMap = cloneDeep(
                cachedVariableVectorMap
            );
            newMap.forEach((elm) => {
                // Find reference to cached object
                const cachedElm = newCachedVariableVectorMap.find(
                    (cachedElm) => cachedElm.variableName === elm.variableName
                );
                if (!cachedElm) {
                    // Add to cache
                    newCachedVariableVectorMap.push(elm);
                } else {
                    // Update existing cache
                    cachedElm.vectorName = elm.vectorName;
                }
            });
            return newCachedVariableVectorMap;
        },
        [cachedVariableVectorMap]
    );

    React.useEffect(() => {
        props.onValidChanged(isValid);
    }, [isValid]);

    React.useEffect(() => {
        const newVariableVectorMap = cloneDeep(
            store.state.editableVariableVectorMap
        );

        setVariableVectorMap(newVariableVectorMap);
        setIsValid(
            isVariableVectorMapValid(
                newVariableVectorMap,
                ":",
                props.vectorData
            )
        );
    }, [store.state.editableVariableVectorMap]);

    React.useEffect(() => {
        setCachedVariableVectorMap(
            store.state.activeExpression.variableVectorMap
        );
    }, [store.state.activeExpression.variableVectorMap]);

    React.useEffect(() => {
        // Create map from expression parse data
        if (!store.state.parseData.isValid) {
            return;
        }

        const newVariableVectorMap = createVariableVectorMapFromVariables(
            store.state.parseData.variables,
            cachedVariableVectorMap
        );

        if (
            !areVariableVectorMapsEqual(
                newVariableVectorMap,
                store.state.editableVariableVectorMap
            )
        ) {
            store.dispatch({
                type: StoreActions.SetVariableVectorMap,
                payload: {
                    variableVectorMap: newVariableVectorMap,
                },
            });
        }
    }, [store.state.parseData]);

    const updateVariableVectorMap = React.useCallback(
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

            setCachedVariableVectorMap(
                createUpdatedCachedVariableVectorMap(newVariableVectorMap)
            );
            store.dispatch({
                type: StoreActions.SetVariableVectorMap,
                payload: {
                    variableVectorMap: newVariableVectorMap,
                },
            });
        },
        [
            variableVectorMap,
            createUpdatedCachedVariableVectorMap,
            setCachedVariableVectorMap,
            setIsValid,
        ]
    );

    return (
        <TableContainer className="VectorSelectorTableContainer">
            {disabled && <div className="DisableOverlay" />}
            <Table>
                <TableBody>
                    {variableVectorMap.map((row, index) => {
                        return (
                            <TableRow
                                tabIndex={-1}
                                key={"row_" + row.variableName}
                            >
                                <TableCell
                                    className="VectorSelectorTableVariableColumn"
                                    align="left"
                                    key={row.variableName}
                                >
                                    {row.variableName}
                                </TableCell>
                                <TableCell
                                    className="VectorSelectorTableVectorSelectorColumn"
                                    key={`cell_${row.variableName}`}
                                >
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
                                            updateVariableVectorMap(
                                                props,
                                                index
                                            )
                                        }
                                        numMetaNodes={0}
                                        maxNumSelectedNodes={1}
                                        numSecondsUntilSuggestionsAreShown={0}
                                        placeholder="Add new vector..."
                                        data={props.vectorData}
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
