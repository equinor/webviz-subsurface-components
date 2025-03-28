import { styled } from "@mui/material/styles";
import React, { useCallback, useContext, useMemo } from "react";
import type { TreeNode, TreeNodeProps } from "react-dropdown-tree-select";
import DropdownTreeSelect from "react-dropdown-tree-select";
import "react-dropdown-tree-select/dist/styles.css";
import { useDispatch } from "react-redux";
import { updateFilteredZones } from "../../redux/actions";
import { DataContext } from "../DataLoader";
import type { Zone } from "@webviz/well-completions-plot";
import { populateSubzonesArray } from "@webviz/well-completions-plot";

const PREFIX = "ZoneSelector";

const classes = {
    root: `${PREFIX}-root`,
};

const StyledDropdownTreeSelect = styled(DropdownTreeSelect)(({ theme }) => ({
    [`& .${classes.root}`]: {
        padding: theme.spacing(1),
        maxWidth: "250px",
    },
}));

//Construct a stratigraphy tree as the input of react-dropdown-tree
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

//Find an array of the selected subzones names from the given selectedNodes
export const findSelectedZones = (
    stratigraphy: Zone[],
    selectedNodes: TreeNodeProps[]
): string[] => {
    const selectedNodeNames = new Set(selectedNodes.map((node) => node.label));
    const result: Zone[] = [];
    const searchZone = (
        zone: Zone,
        selectedNodeNames: Set<string>,
        result: Zone[]
    ) => {
        if (selectedNodeNames.has("All") || selectedNodeNames.has(zone.name))
            populateSubzonesArray(zone, result);
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

/**
 * A react component for selecting zones to display in the completions plot
 */
const ZoneSelector: React.FC = React.memo(() => {
    // Use input data directly
    const data = useContext(DataContext);
    // Redux
    const dispatch = useDispatch();
    // Memo
    const stratigraphyTree = useMemo(
        () => extractStratigraphyTree(data.stratigraphy),
        [data.stratigraphy]
    );
    // Handlers
    const handleSelectionChange = useCallback(
        (_: TreeNode, selectedNodes: TreeNodeProps[]) =>
            dispatch(
                updateFilteredZones(
                    findSelectedZones(data.stratigraphy, selectedNodes)
                )
            ),
        [dispatch, data.stratigraphy]
    );
    // Render
    return (
        <StyledDropdownTreeSelect
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
