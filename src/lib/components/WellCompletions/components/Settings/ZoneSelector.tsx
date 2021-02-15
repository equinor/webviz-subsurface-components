import { MultiSelect } from "@equinor/eds-core-react";
import { createStyles, makeStyles } from "@material-ui/core";
import React, { useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFilteredZones } from "../../redux/reducer";
import { WellCompletionsState } from "../../redux/store";
import { DataContext } from "../../WellCompletions";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            width: "150px",
        },
    })
);
const ZoneSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    const data = useContext(DataContext);
    // Redux
    const dispatch = useDispatch();
    const filteredZones = useSelector(
        (st: WellCompletionsState) => st.ui.filteredZones
    );
    const stratigraphy = useMemo(
        () => data.stratigraphy.map(zone => zone.name),
        [data]
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
            selectedOptions={filteredZones}
            items={stratigraphy || []}
            handleSelectedItemsChange={handleSelectionChange}
        />
    );
});

ZoneSelector.displayName = "ZoneSelector";
export default ZoneSelector;
