import React from "react";

import { cloneDeep } from "lodash";

import {
    ExpressionType,
    // ExternalParseData,
    VariableVectorMapType,
} from "../../utils/VectorCalculatorTypes";

type ActionMap<
    M extends {
        [index: string]: {
            [key: string]:
                | boolean
                | string
                | string[]
                | ExpressionStatus
                | ExpressionType
                | ExpressionType[]
                | VariableVectorMapType[];
        };
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
    SetExpression = "SET_EXPRESSION",
    SetEditableExpressionStatus = "SET_EDITABLE_EXPRESSION_STATUS",
    SetName = "SET_NAME",
    SetDescription = "SET_DESCRIPTION",
    SetVariableVectorMap = "SET_VARIABLE_VECTOR_MAP",
    SetParseMessage = "SET_PARSE_MESSAGE",
}

type StoreState = {
    expressions: ExpressionType[];
    activeExpression: ExpressionType;

    editableExpression: ExpressionType;
    editableExpressionStatus: ExpressionStatus;
    editableNameStatus: boolean;
    editableVariableVectorMapStatus: boolean;

    externalParsing: boolean;
    parseMessage: string;
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
    [StoreActions.SetEditableExpressionStatus]: {
        status: ExpressionStatus;
    };
    [StoreActions.SaveEditableExpression]: {};
    [StoreActions.ResetEditableExpression]: {};
    [StoreActions.SetName]: {
        name: string;
        status: boolean;
    };
    [StoreActions.SetExpression]: {
        expression: string;
    };
    [StoreActions.SetDescription]: {
        description: string;
    };
    [StoreActions.SetVariableVectorMap]: {
        variableVectorMap: VariableVectorMapType[];
        status: boolean;
    };
    [StoreActions.SetParseMessage]: {
        message: string;
    };
};

export type Actions = ActionMap<Payload>[keyof ActionMap<Payload>];

// TODO: Add usage of getDefaultExpression()?
const initialEditableExpression: ExpressionType = {
    name: "",
    expression: "",
    id: "",
    variableVectorMap: [],
    isValid: false,
    isDeletable: true,
};
// const initialExternalParseData: ExternalParseData = {
//     expression: "",
//     id: "",
//     variables: [],
//     isValid: false,
//     message: "",
// };

const initializeStore = (initializerArg: StoreProviderProps): StoreState => {
    return {
        activeExpression: initialEditableExpression,
        editableExpression: initialEditableExpression,
        editableExpressionStatus: ExpressionStatus.Invalid,
        editableNameStatus: false,
        editableVariableVectorMapStatus: false,
        expressions: initializerArg.initialExpressions,
        externalParsing: initializerArg.externalParsing,
        parseMessage: "",
    };
};

const StoreReducer = (state: StoreState, action: Actions): StoreState => {
    switch (action.type) {
        case StoreActions.AddExpressions: {
            // TODO: Ensure no duplicate ids?
            const newExpressions = cloneDeep(state.expressions);
            for (const elm of action.payload.expressions) {
                newExpressions.push(elm);
            }
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
                const initializeArgs = {
                    initialExpressions: newExpressions,
                    externalParsing: state.externalParsing,
                };
                return initializeStore(initializeArgs);
            }

            return { ...state, expressions: newExpressions };
        }

        case StoreActions.SetActiveExpression: {
            if (!state.expressions.includes(action.payload.expression)) {
                return { ...state };
            }
            return {
                ...state,
                activeExpression: action.payload.expression,
                editableExpression: action.payload.expression,
                editableExpressionStatus: ExpressionStatus.Evaluating,
                editableNameStatus: false,
                editableVariableVectorMapStatus: false,
                parseMessage: "",
            };
        }

        case StoreActions.SaveEditableExpression: {
            if (!state.editableExpression.isValid) {
                return { ...state };
            }

            const newExpressions = state.expressions.map((elm) => {
                if (elm.id === state.editableExpression.id) {
                    return state.editableExpression;
                }
                return elm;
            });

            return {
                ...state,
                expressions: newExpressions,
                activeExpression: state.editableExpression,
            };
        }
        case StoreActions.ResetEditableExpression: {
            return { ...state, editableExpression: state.activeExpression };
        }

        case StoreActions.SetDescription: {
            return {
                ...state,
                editableExpression: {
                    ...state.editableExpression,
                    description: action.payload.description,
                },
            };
        }
        case StoreActions.SetName: {
            const newEditableExpression: ExpressionType = {
                ...state.editableExpression,
                name: action.payload.name,
                isValid:
                    state.editableExpressionStatus == ExpressionStatus.Valid &&
                    state.editableVariableVectorMapStatus &&
                    action.payload.status,
            };
            return {
                ...state,
                editableExpression: newEditableExpression,
                editableNameStatus: action.payload.status,
            };
        }
        case StoreActions.SetExpression: {
            const newEditableExpression = {
                ...state.editableExpression,
                expression: action.payload.expression,
            };

            // If external parsing is used - evaluating state is set
            if (state.externalParsing) {
                return {
                    ...state,
                    editableExpression: newEditableExpression,
                    editableExpressionStatus: ExpressionStatus.Evaluating,
                };
            }
            return { ...state, editableExpression: newEditableExpression };
        }
        case StoreActions.SetEditableExpressionStatus: {
            const newEditableExpression: ExpressionType = {
                ...state.editableExpression,
                isValid:
                    state.editableVariableVectorMapStatus &&
                    state.editableNameStatus &&
                    action.payload.status === ExpressionStatus.Valid,
            };
            return {
                ...state,
                editableExpression: newEditableExpression,
                editableExpressionStatus: action.payload.status,
            };
        }
        case StoreActions.SetVariableVectorMap: {
            const newEditableExpression: ExpressionType = {
                ...state.editableExpression,
                variableVectorMap: action.payload.variableVectorMap,
                isValid:
                    state.editableExpressionStatus === ExpressionStatus.Valid &&
                    state.editableNameStatus &&
                    action.payload.status,
            };
            return {
                ...state,
                editableExpression: newEditableExpression,
                editableVariableVectorMapStatus: action.payload.status,
            };
        }
        case StoreActions.SetParseMessage: {
            return { ...state, parseMessage: action.payload.message };
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
    externalParsing: boolean;
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
