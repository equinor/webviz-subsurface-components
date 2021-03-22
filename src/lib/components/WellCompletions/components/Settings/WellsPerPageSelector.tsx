import { NativeSelect } from "@equinor/eds-core-react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateWellsPerPage } from "../../redux/actions";

const wellsPerPageOptions = [25, 50];
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
            maxWidth: "120px",
        },
    })
);

const WellsPerPageSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    // handlers
    const onWellsPerPageChange = useCallback(
        event => dispatch(updateWellsPerPage(event.target.value)),
        [dispatch]
    );
    return (
        <NativeSelect
            label={"Wells per page"}
            id="wells-per-page-select"
            className={classes.root}
            onChange={onWellsPerPageChange}
        >
            {wellsPerPageOptions.map(value => (
                <option key={`option-${value}`} value={value}>
                    {value}
                </option>
            ))}
        </NativeSelect>
    );
});

WellsPerPageSelector.displayName = "WellsPerPageSelector";
export default WellsPerPageSelector;
