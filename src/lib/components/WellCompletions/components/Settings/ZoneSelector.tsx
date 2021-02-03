import { MultiSelect } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFilteredZones } from "../../redux/reducer";
import { WellCompletionsState } from "../../redux/store";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: "150px",
        },
    })
);
const ZoneSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    const stratigraphy = useSelector((st: WellCompletionsState) =>
        st.dataModel.data?.stratigraphy.map(zone => zone.name)
    );
    const filteredZones = useSelector(
        (st: WellCompletionsState) => st.ui.filteredZones
    );
    // handlers
    const handleSelectionChange = useCallback(
        event => dispatch(updateFilteredZones(event.selectedItems)),
        [dispatch]
    );
    return (
        <MultiSelect
            className={classes.root}
            label="Select Zones"
            initialSelectedItems={filteredZones}
            items={stratigraphy || []}
            handleSelectedItemsChange={handleSelectionChange}
        />
    );
});

ZoneSelector.displayName = "ZoneSelector";
export default ZoneSelector;
