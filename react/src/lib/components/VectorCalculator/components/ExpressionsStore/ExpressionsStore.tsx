import React from "react";
import { cloneDeep } from "lodash";

import {
    ExpressionParsingData,
    ExpressionType,
    VariableVectorMapType,
} from "../../utils/VectorCalculatorTypes";
import { areVariableVectorMapsEqual } from "../../utils/VectorCalculatorHelperFunctions";

type ActionMap<
    M extends {
        [index: string]:
            | {
                  [key: string]:
                      | boolean
                      | number
                      | string
                      | string[]
                      | ExpressionParsingData
                      | ExpressionType
                      | ExpressionType[]
                      | VariableVectorMapType[];
              }
            | undefined;
    }
> = {
    [Key in keyof M]: M[Key] extends undefined
        ? {
              type: Key;
          }
        : {
              type: Key;
              payload: M[Key];
          };
};

export enum ExpressionStatus {
    Valid = 1,
    Invalid = 2,
    Evaluating = 3,
}

export enum StoreActions {
    AddExpressions = "ADD_EXPRESSIONS",
    DeleteExpressions = "DELETE_EXPRESSIONS",
    SetActiveExpression = "SET_ACTIVE_EXPRESSION",
    SaveEditableExpression = "SAVE_EDITABLE_EXPRESSION",
    ResetEditableExpression = "RESET_EDITABLE_EXPRESSION",
    SetExpressionTypeValid = "SET_EXPRESSION_TYPE_VALID",
    SetExpression = "SET_EXPRESSION",
    SetName = "SET_NAME",
    SetDescription = "SET_DESCRIPTION",
    SetVariableVectorMap = "SET_VARIABLE_VECTOR_MAP",
    SetParsingData = "SET_PARSING_DATA",
}

type StoreState = {
    expressions: ExpressionType[];
    activeExpression: ExpressionType;

    editableExpression: string;
    editableName: string;
    editableDescription?: string;
    editableVariableVectorMap: VariableVectorMapType[];
    editableExpressionTypeValid: boolean;

    parseData: ExpressionParsingData;
};

type Payload = {
    [StoreActions.AddExpressions]: {
        expressions: ExpressionType[];
    };
    [StoreActions.DeleteExpressions]: {
        ids: string[];
    };
    [StoreActions.SetActiveExpression]: {
        expression: ExpressionType;
    };
    [StoreActions.SaveEditableExpression]: undefined;
    [StoreActions.ResetEditableExpression]: undefined;
    [StoreActions.SetExpressionTypeValid]: {
        isValid: boolean;
    };
    [StoreActions.SetName]: {
        name: string;
    };
    [StoreActions.SetExpression]: {
        expression: string;
    };
    [StoreActions.SetDescription]: {
        description?: string;
    };
    [StoreActions.SetVariableVectorMap]: {
        variableVectorMap: VariableVectorMapType[];
    };
    [StoreActions.SetParsingData]: {
        data: ExpressionParsingData;
    };
};

export type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

const initialEditableExpression: ExpressionType = {
    name: "",
    expression: "",
    id: "",
    variableVectorMap: [],
    isValid: false,
    isDeletable: true,
};

export const createExpressionTypeFromEditableData = (
    state: StoreState
): ExpressionType => {
    return {
        ...state.activeExpression,
        name: state.editableName,
        expression: state.editableExpression,
        description: state.editableDescription,
        variableVectorMap: state.editableVariableVectorMap,
    };
};

export const isExpressionEdited = (state: StoreState): boolean => {
    const areEqual =
        state.activeExpression.name === state.editableName &&
        state.activeExpression.expression === state.editableExpression &&
        state.activeExpression.description === state.editableDescription &&
        areVariableVectorMapsEqual(
            state.activeExpression.variableVectorMap,
            state.editableVariableVectorMap
        );
    return !areEqual;
};

const initializeStore = (initializerArg: StoreProviderProps): StoreState => {
    return {
        expressions: initializerArg.initialExpressions,
        activeExpression: initialEditableExpression,

        editableExpression: initialEditableExpression.expression,
        editableName: initialEditableExpression.name,
        editableDescription: initialEditableExpression.description,
        editableVariableVectorMap: initialEditableExpression.variableVectorMap,
        editableExpressionTypeValid: false,

        parseData: { isValid: false, parsingMessage: "", variables: [] },
    };
};

const StoreReducer = (state: StoreState, action: Actions): StoreState => {
    switch (action.type) {
        case StoreActions.AddExpressions: {
            const newExpressions = cloneDeep(state.expressions);
            newExpressions.push(...action.payload.expressions);
            return { ...state, expressions: newExpressions };
        }

        case StoreActions.DeleteExpressions: {
            const deletableExpressions = state.expressions.filter((elm) => {
                return action.payload.ids.includes(elm.id) && elm.isDeletable;
            });
            const newExpressions = state.expressions.filter((elm) => {
                return !deletableExpressions.includes(elm);
            });

            // If active expression is deleted
            if (action.payload.ids.includes(state.activeExpression.id)) {
                return {
                    ...state,
                    expressions: newExpressions,
                    activeExpression: initialEditableExpression,
                    editableExpression: initialEditableExpression.expression,
                    editableName: initialEditableExpression.name,
                    editableDescription: initialEditableExpression.description,
                    editableVariableVectorMap:
                        initialEditableExpression.variableVectorMap,
                    editableExpressionTypeValid: false,
                    parseData: {
                        isValid: false,
                        parsingMessage: "",
                        variables: [],
                    },
                };
            }

            return { ...state, expressions: newExpressions };
        }

        case StoreActions.SetActiveExpression: {
            if (!state.expressions.includes(action.payload.expression)) {
                return state;
            }
            return {
                ...state,
                activeExpression: action.payload.expression,
                editableName: action.payload.expression.name,
                editableExpression: action.payload.expression.expression,
                editableDescription: action.payload.expression.description,
                editableVariableVectorMap:
                    action.payload.expression.variableVectorMap,
            };
        }

        case StoreActions.SaveEditableExpression: {
            // Create expression with editable data
            const newActiveExpression = {
                ...state.activeExpression,
                name: state.editableName,
                expression: state.editableExpression,
                description: state.editableDescription,
                variableVectorMap: state.editableVariableVectorMap,
                isValid: true,
            };

            const newExpressions = state.expressions.map((elm) => {
                if (elm.id === newActiveExpression.id) {
                    return newActiveExpression;
                }
                return elm;
            });

            return {
                ...state,
                expressions: newExpressions,
                activeExpression: newActiveExpression,
            };
        }
        case StoreActions.ResetEditableExpression: {
            return {
                ...state,
                editableName: state.activeExpression.name,
                editableExpression: state.activeExpression.expression,
                editableDescription: state.activeExpression.description,
                editableVariableVectorMap:
                    state.activeExpression.variableVectorMap,
            };
        }
        case StoreActions.SetExpressionTypeValid: {
            return {
                ...state,
                editableExpressionTypeValid: action.payload.isValid,
            };
        }
        case StoreActions.SetDescription: {
            return {
                ...state,
                editableDescription: action.payload.description,
            };
        }
        case StoreActions.SetName: {
            return {
                ...state,
                editableName: action.payload.name,
            };
        }
        case StoreActions.SetExpression: {
            return {
                ...state,
                editableExpression: action.payload.expression,
            };
        }
        case StoreActions.SetVariableVectorMap: {
            return {
                ...state,
                editableVariableVectorMap: action.payload.variableVectorMap,
            };
        }
        case StoreActions.SetParsingData: {
            return { ...state, parseData: action.payload.data };
        }
    }
};

type Context = {
    state: StoreState;
    dispatch: React.Dispatch<Actions>;
};

const StoreContext = React.createContext<Context | undefined>(undefined);

interface StoreProviderProps {
    initialExpressions: ExpressionType[];
}

export const StoreProvider: React.FC<StoreProviderProps> = (props) => {
    const [state, dispatch] = React.useReducer(
        StoreReducer,
        props,
        initializeStore
    );

    return (
        <StoreContext.Provider value={{ state, dispatch }}>
            {props.children}
        </StoreContext.Provider>
    );
};

export const useStore = (): Context =>
    React.useContext(StoreContext) as Context;
