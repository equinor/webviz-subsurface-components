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
const WellAttributesSelector: React.FC = React.memo(() => {
    // Style
    const classes = useStyles();
    const data = useContext(DataContext);
    // Redux
    const dispatch = useDispatch();
    const attributeKeys = useSelector(
        (st: WellCompletionsState) => st.attributes.attributeKeys
    );
    const filterByAttributes = useSelector(
        (st: WellCompletionsState) => st.ui.filterByAttributes
    );
    const wells = useMemo(() => data.wells, [data]);
    const attributesTree = useMemo(
        () => extractAttributesTree(wells, attributeKeys),
        [wells]
    );
    const hintText = useMemo(() => {
        const allowedValues = computeAllowedAttributeValues(filterByAttributes);
        return (
            "Well selection criteria: " +
            Array.from(allowedValues.entries())
                .map(
                    ([key, values]) =>
                        `"${key}" ${
                            values.size === 1
                                ? ` is "${Array.from(values)[0]}"`
                                : ` is in [${Array.from(values)}]`
                        }`
                )
                .join(" and ")
        );
    }, [filterByAttributes]);
    // handlers
    const handleSelectionChange = useCallback(
        (selection) =>
            dispatch(updateFilterByAttributes(selection.selectedNodes)),
        [dispatch]
    );
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
