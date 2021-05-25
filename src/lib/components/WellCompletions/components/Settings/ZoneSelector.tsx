import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback, useContext, useMemo } from "react";
import DropdownTreeSelect, { TreeNodeProps } from "react-dropdown-tree-select";
import "react-dropdown-tree-select/dist/styles.css";
import { useDispatch } from "react-redux";
import { updateFilteredZones } from "../../redux/actions";
import { Zone } from "../../redux/types";
import { findSubzones } from "../../utils/dataUtil";
import { DataContext } from "../DataLoader";

const extractStratigraphyTree = (stratigraphy: Zone[]): TreeNodeProps => {
    const root: TreeNodeProps = {
        label: "All",
        value: "All",
        children: [],
        checked: true,
        expanded: true,
    };
    const constructTree = (zone: Zone, parentNode: TreeNodeProps) => {
        const newChild: TreeNodeProps = {
            label: zone.name,
            value: zone.name,
            children: [],
        };
        parentNode.children?.push(newChild);
        if (zone.subzones !== undefined)
            zone.subzones.forEach((subzone) =>
                constructTree(subzone, newChild)
            );
    };
    stratigraphy.forEach((zone) => constructTree(zone, root));
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

    const stratigraphyTree = useMemo(
        () => extractStratigraphyTree(data.stratigraphy),
        [data.stratigraphy]
    );
    // handlers
    const handleSelectionChange = useCallback(
        (_, selectedNodes) =>
            dispatch(
                updateFilteredZones(
                    findSelectedZones(data.stratigraphy, selectedNodes)
                )
            ),
        [dispatch, data.stratigraphy]
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
