import { SmartNodeSelector } from "@webviz/core-components";
import React, { useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFilterByAttributes } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";
import { extractAttributesTree } from "../../utils/dataUtil";
import { DataContext } from "../DataLoader";

const WellAttributesSelector: React.FC = React.memo(() => {
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
    // handlers
    const handleSelectionChange = useCallback(
        (selection) =>
            dispatch(updateFilterByAttributes(selection.selectedNodes)),
        [dispatch]
    );
    return (
        <SmartNodeSelector
            id="AttributesSelector"
            key="attributes-selector"
            numMetaNodes={0}
            delimiter=":"
            selectedNodes={filterByAttributes}
            setProps={handleSelectionChange}
            label="Filter by Attributes"
            data={attributesTree}
        />
    );
});

WellAttributesSelector.displayName = "WellAttributesSelector";
export default WellAttributesSelector;
