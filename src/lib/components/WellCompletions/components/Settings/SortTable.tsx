import { Button, Icon, NativeSelect, Table } from "@equinor/eds-core-react";
import { add_box, delete_to_trash } from "@equinor/eds-icons";
import {
    Box,
    createStyles,
    makeStyles,
    Theme,
    // eslint-disable-next-line prettier/prettier
    Tooltip
} from "@material-ui/core";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteSortKey, updateSortKey } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";
import { SortDirection } from "../../redux/types";
import {
    SORT_BY_COMPLETION_DATE,
    SORT_BY_NAME,
    // eslint-disable-next-line prettier/prettier
    SORT_BY_STRATIGRAPHY_DEPTH
} from "../../utils/sort";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: "relative",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            minWidth: "300px",
        },
        add: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: theme.spacing(3),
        },
        select: {
            maxWidth: "150px",
        },
    })
);
Icon.add({ add_box }); // (this needs only be done once)
Icon.add({ delete_to_trash }); // (this needs only be done once)
/**
 * A table that allows adding or removing sorting layers.
 * There is also an option per row to sort by ascending or descending order
 */
const SortTable: React.FC = React.memo(() => {
    const classes = useStyles();
    // Local states
    // Sort key in the placeholder row
    const [sortKeyToAdd, setSortKeyToAdd] = useState<string>();
    // Sort direction in the placeholder row
    const [sortDirectionToAdd, setSortDirectionToAdd] =
        useState<SortDirection>("Ascending");

    // Redux
    const dispatch = useDispatch();
    // The attributes that we are currently sorting by
    const sortBy = useSelector((st: WellCompletionsState) => st.ui.sortBy);
    // All the attribute keys
    const attributeKeys = useSelector(
        (st: WellCompletionsState) => st.attributes.attributeKeys
    );
    // Memo
    // Apart from the user defined attribute, we can also sort by well name, stratigraphy depth etc
    const sortKeys = useMemo(() => {
        const keys = new Set<string>([
            SORT_BY_NAME,
            SORT_BY_STRATIGRAPHY_DEPTH,
            SORT_BY_COMPLETION_DATE,
        ]);
        attributeKeys.forEach((key) => keys.add(key));
        return keys;
    }, [attributeKeys]);
    // The attribute keys that are not yet added to the current sorting set
    const availableToAdd = useMemo(
        () => Array.from(sortKeys).filter((key) => !(key in sortBy)),
        [sortKeys, sortBy]
    );

    // Effects
    // Update the sort key in the placeholder row to be the first item in the available attribute key set
    useEffect(() => {
        if (
            availableToAdd.length > 0 &&
            (!sortKeyToAdd || !availableToAdd.includes(sortKeyToAdd))
        )
            setSortKeyToAdd(availableToAdd[0]);
    }, [availableToAdd, sortKeyToAdd]);

    // Handlers
    // Update the sort key in the placeholder row
    const onSortKeyToAddChange = useCallback(
        (event) => setSortKeyToAdd(event.target.value),
        [setSortKeyToAdd]
    );
    // Update the sort direction in the placeholder row
    const onSortDirectionToAddChange = useCallback(
        () =>
            setSortDirectionToAdd(
                sortDirectionToAdd === "Ascending" ? "Descending" : "Ascending"
            ),
        [setSortDirectionToAdd, sortDirectionToAdd]
    );

    // Add or update sort key and direction
    const onUpdateSortKey = useCallback(
        (sortKey, sortDirection) =>
            dispatch(updateSortKey({ sortKey, sortDirection })),
        [dispatch]
    );
    // Remove sort key and direction
    const onDeleteSortKey = useCallback(
        (sortKey) => dispatch(deleteSortKey(sortKey)),
        [dispatch]
    );

    // Render
    return (
        <Box
            marginTop={1}
            marginX={1}
            marginBottom={2}
            className={classes.root}
        >
            <Table>
                <Table.Head>
                    <Table.Row>
                        <Table.Cell>Sort by</Table.Cell>
                        <Table.Cell>Direction</Table.Cell>
                        <Table.Cell></Table.Cell>
                    </Table.Row>
                </Table.Head>
                <Table.Body>
                    {Object.keys(sortBy).map((sortKey) => (
                        <Table.Row key={`sort-by-${sortKey}`}>
                            <Table.Cell>{sortKey}</Table.Cell>
                            <Table.Cell>
                                <Button
                                    aria-controls="simple-menu"
                                    aria-haspopup="true"
                                    variant="ghost"
                                    onClick={() =>
                                        onUpdateSortKey(
                                            sortKey,
                                            sortBy[sortKey] === "Ascending"
                                                ? "Descending"
                                                : "Ascending"
                                        )
                                    }
                                >
                                    {sortBy[sortKey]}
                                </Button>
                            </Table.Cell>
                            <Table.Cell>
                                <Button
                                    aria-controls="simple-menu"
                                    aria-haspopup="true"
                                    variant="ghost_icon"
                                    onClick={() => onDeleteSortKey(sortKey)}
                                >
                                    <Icon
                                        color="currentColor"
                                        name="delete_to_trash"
                                    />
                                </Button>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                    {/* Placeholder row */}
                    <Table.Row key={`sort-by-placeholder`}>
                        <Table.Cell>
                            <NativeSelect
                                className={classes.select}
                                id="range-display-mode-selector"
                                label=""
                                value={sortKeyToAdd}
                                onChange={onSortKeyToAddChange}
                            >
                                {availableToAdd.map((key) => (
                                    <option key={key}>{key}</option>
                                ))}
                            </NativeSelect>
                        </Table.Cell>
                        <Table.Cell>
                            <Button
                                aria-controls="simple-menu"
                                aria-haspopup="true"
                                variant="ghost"
                                onClick={onSortDirectionToAddChange}
                            >
                                {sortDirectionToAdd}
                            </Button>
                        </Table.Cell>
                        <Table.Cell>
                            <Tooltip title="Add sorting level">
                                <Button
                                    aria-controls="simple-menu"
                                    aria-haspopup="true"
                                    variant="ghost_icon"
                                    onClick={() =>
                                        onUpdateSortKey(
                                            sortKeyToAdd,
                                            sortDirectionToAdd
                                        )
                                    }
                                >
                                    <Icon color="currentColor" name="add_box" />
                                </Button>
                            </Tooltip>
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </Box>
    );
});

SortTable.displayName = "SortTable";
export default SortTable;
