import React from "react";
import PropTypes from "prop-types";

import { VectorCalculatorComponent } from "./components/VectorCalculatorComponent";
import { string } from "jsverify";
import "!style-loader!css-loader!./VectorCalculator.css";

/**
 * VectorCalculator is a component that allows to calculate new vectors by creating a mathematical expression
 * based existing vectors.
 *
 * New calcualted vectors are created by writing a mathematical equation with single character variables,
 * where each variable is assigned a vector from the set of existing vectors.
 *
 * The component provides a list of valid expressions which can be used externally to calculate the wanted
 * vector data.
 *
 * The component can handle validation of the mathematical equations internally or externally. External
 * validation can be utilized to obtain coherent parsing in the component and the user.
 */
export const VectorCalculator = (props) => {
    return (
        <div className={"VectorCalculator"}>
            <VectorCalculatorComponent {...props} />
        </div>
    );
};

VectorCalculator.defaultProps = {
    // Set all non isRequired props
    isDashControlled: false,
    maxExpressionDescriptionLength: 50,
};

VectorCalculator.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string.isRequired,

    /**
     * Existing vectors for vector selector
     */
    vectors: PropTypes.array.isRequired,

    /**
     * Pre-defined vector calculator expressions.
     * Each expression consist of an expression name, mathematical expression string with variables
     * and a map of characther variables and the corresponding vector name.
     */
    expressions: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            expression: PropTypes.string.isRequired,
            id: PropTypes.string.isRequired,
            variableVectorMap: PropTypes.arrayOf(
                PropTypes.shape({
                    variableName: string.isRequired,
                    vectorName: string.isRequired,
                })
            ).isRequired,
            description: PropTypes.string,
            isValid: PropTypes.bool.isRequired,
            isDeletable: PropTypes.bool.isRequired,
        })
    ).isRequired,

    /**
     * Set True when component is utilized by Dash plugin.
     * When controlled in Dash, the user must provide an external expression parser responsible for
     * validation of the active mathematical expression and provide the parsing data for the
     * externalParseData prop.
     * If set to false, an internal JS-parser library is utilized for validation of the mathematical
     * expressions.
     */
    isDashControlled: PropTypes.bool,

    /**
     * Set maximal number of characters for expression description text
     */
    maxExpressionDescriptionLength: PropTypes.number,

    /**
     * Data for external parsing of mathematical expression
     */
    externalParseData: PropTypes.shape({
        expression: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        variables: PropTypes.arrayOf(string.isRequired).isRequired,
        isValid: PropTypes.bool.isRequired,
    }),

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func,
};
