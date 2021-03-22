/**
 * This file is created in order to let dash-generate-components extract metadata.
 * At the moment, the library does not support generating components from typescript directly
 * https://github.com/plotly/dash/issues/719
 */

import Ajv from "ajv";
import PropTypes from "prop-types";
import React, { useMemo } from "react";
import WellCompletionComponent from "./components/WellCompletionComponent";

const inputSchema = require("../../../../inputSchema/wellCompletions.json");
const ajv = new Ajv();

const inputSchema = require("../../../../inputSchema/wellCompletions.json");
const ajv = new Ajv();

export const DataContext = React.createContext();
const WellCompletions = props => {
    const valid = useMemo(() => {
        //check against the json schema
        const validate = ajv.compile(inputSchema);
        const valid = validate(props.data);
        //If input data does not satisfy the schema
        if (!valid) alert(JSON.stringify(validate.errors));
        return valid;
    }, [props.data]);
    return valid && <WellCompletionComponent id={props.id} data={props.data} />;
};

WellCompletions.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.object,
};

export default WellCompletions;
