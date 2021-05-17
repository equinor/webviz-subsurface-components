import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback, useContext, useMemo } from "react";
import DropdownTreeSelect, { TreeNodeProps } from "react-dropdown-tree-select";
import "react-dropdown-tree-select/dist/styles.css";
import { useDispatch, useSelector } from "react-redux";
import { updateFilteredZones } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";
import { Zone } from "../../redux/types";
import { findSubzones } from "../../utils/dataUtil";
import { DataContext } from "../DataLoader";

const extractStratigraphyTree = (
    stratigraphy: Zone[],
    filteredZones: string[]
): TreeNodeProps => {
    const filteredZonesSet = new Set(filteredZones);
    const root: TreeNodeProps = {
        label: "All",
        value: "All",
        expanded: true,
        isDefaultValue: false,
        children: [],
    };
    const constructTree = (
        zone: Zone,
        parentNode: TreeNodeProps,
        filteredZones
    ) => {
        const newChild: TreeNodeProps = {
            label: zone.name,
            value: zone.name,
            children: [],
            expanded: true,
            isDefaultValue: filteredZonesSet.has(zone.name),
        };
        parentNode.children?.push(newChild);
        if (zone.subzones !== undefined)
            zone.subzones.forEach((subzone) =>
                constructTree(subzone, newChild, filteredZones)
            );
    };
    stratigraphy.forEach((zone) => constructTree(zone, root, filteredZones));
    return root;
};

//DFS
export const findSelectedZones = (
    stratigraphy: Zone[],
    selectedNodes: TreeNodeProps[]
): string[] => {
    const selectedNodeNames = new Set(selectedNodes.map((node) => node.label));
    const result: Zone[] = [];
    const searchZone = (zone, selectedNodeNames, result) => {
        if (selectedNodeNames.has("All") || selectedNodeNames.has(zone.name))
            findSubzones(zone, result);
        else if (zone.subzones)
            zone.subzones.forEach((subzone) =>
                searchZone(subzone, selectedNodeNames, result)
            );
    };
    stratigraphy.forEach((subzone) =>
        searchZone(subzone, selectedNodeNames, result)
    );
    return result.map((zone) => zone.name);
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
            maxWidth: "250px",
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
    const allSubzoneCount = useMemo(() => {
        const result: Zone[] = [];
        data.stratigraphy.forEach((zone) => findSubzones(zone, result));
        return result.length;
    }, [data.stratigraphy]);

    const stratigraphyTree = useMemo(
        () => extractStratigraphyTree(data.stratigraphy, filteredZones),
        [data.stratigraphy, filteredZones]
    );
    // handlers
    const handleSelectionChange = useCallback(
        (_, selectedNodes) => {
            //Deselect all
            if (
                selectedNodes.length === 1 &&
                selectedNodes[0].label === "All" &&
                filteredZones.length === allSubzoneCount
            )
                dispatch(updateFilteredZones([]));
            else
                dispatch(
                    updateFilteredZones(
                        findSelectedZones(data.stratigraphy, selectedNodes)
                    )
                );
        },
        [dispatch, data.stratigraphy, filteredZones]
    );
    return (
        <DropdownTreeSelect
            texts={{ placeholder: "Select Zone(s)..." }}
            inlineSearchInput={true}
            showPartiallySelected={true}
            data={stratigraphyTree}
            onChange={handleSelectionChange}
            className={classes.root}
            keepTreeOnSearch={true}
        />
    );
});

ZoneSelector.displayName = "ZoneSelector";
export default ZoneSelector;
