import { NativeSelect } from "@equinor/eds-core-react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCurrentDataType } from "../../redux/actions";
import { GroupTreeState } from "../../redux/store";
import { DataType, DataTypes } from "../../redux/types";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            minWidth: "170px",
            maxWidth: "170px",
            padding: theme.spacing(1),
        },
    })
);

const DataSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    const currentDataType = useSelector(
        (st: GroupTreeState) => st.ui.currentDataType
    );
    // handlers
    const handleSelectedItemChange = useCallback(
        (event) => dispatch(updateCurrentDataType(event.target.value)),
        [dispatch]
    );

    return (
        <NativeSelect
            className={classes.root}
            id="data-type-selector"
            label="Data Type"
            value={currentDataType}
            onChange={handleSelectedItemChange}
        >
            {Object.keys(DataTypes).map((datatype) => (
                <option key={`option-${datatype}`} value={datatype}>
                    {DataTypes[datatype as DataType]}
                </option>
            ))}
        </NativeSelect>
    );
});

DataSelector.displayName = "DataSelector";
export default DataSelector;
