import { Typography } from "@equinor/eds-core-react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { SmartNodeSelector } from "@webviz/core-components";
import React, { useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFilterByAttributes } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";
import {
    computeAllowedAttributeValues,
    // eslint-disable-next-line prettier/prettier
    extractAttributesTree
} from "../../utils/dataUtil";
import { DataContext } from "../DataLoader";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
            maxWidth: "250px",
            display: "flex",
            flex: 1,
            flexDirection: "column",
        },
    })
);
/**
 * A react component to allow the users to select wells by attribute values
 */
const WellAttributesSelector: React.FC = React.memo(() => {
    // Style
    const classes = useStyles();
    // Direct access to the input data
    const data = useContext(DataContext);
    // Redux
    const dispatch = useDispatch();
    // All the attribute keys available
    const attributeKeys = useSelector(
        (st: WellCompletionsState) => st.attributes.attributeKeys
    );
    const filterByAttributes = useSelector(
        (st: WellCompletionsState) => st.ui.filterByAttributes
    );
    const wells = useMemo(() => data.wells, [data]);
    //Create the tree that the SmartNodeSelector can accept as input.
    const attributesTree = useMemo(
        () => extractAttributesTree(wells, attributeKeys),
        [wells]
    );
    //Create the hint text for the user to better understand how the filter applies.
    const hintText = useMemo(() => {
        const allowedValues = computeAllowedAttributeValues(filterByAttributes);
        return (
            "Well selection criteria: " +
            Array.from(allowedValues.entries())
                .map(
                    ([key, values]) =>
                        //Within the same attribute, we use OR relation
                        `"${key}" ${
                            values.size === 1
                                ? ` is "${Array.from(values)[0]}"`
                                : ` is in [${Array.from(values)}]`
                        }`
                )
                //In between different attribute key, we use AND relation
                .join(" and ")
        );
    }, [filterByAttributes]);
    // Handlers
    const handleSelectionChange = useCallback(
        (selection) =>
            dispatch(updateFilterByAttributes(selection.selectedNodes)),
        [dispatch]
    );
    // Render
    return (
        <div className={classes.root}>
            <SmartNodeSelector
                id="AttributesSelector"
                key="attributes-selector"
                numMetaNodes={0}
                delimiter=":"
                selectedTags={filterByAttributes}
                setProps={handleSelectionChange}
                label="Filter by Attributes"
                data={attributesTree}
                numSecondsUntilSuggestionsAreShown={0.5}
            />
            <Typography>{hintText}</Typography>
        </div>
    );
});

WellAttributesSelector.displayName = "WellAttributesSelector";
export default WellAttributesSelector;
