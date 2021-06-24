import { NativeSelect } from "@equinor/eds-core-react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateWellsPerPage } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";

const wellsPerPageOptions = [10, 25, 50];
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
            maxWidth: "170px",
        },
    })
);
/**
 * A drop down for selecting how many wells to display per page
 */
const WellsPerPageSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    const wellsPerPage = useSelector(
        (st: WellCompletionsState) => st.ui.wellsPerPage
    );
    // Handlers
    const onWellsPerPageChange = useCallback(
        (event) => dispatch(updateWellsPerPage(event.target.value)),
        [dispatch]
    );
    // Render
    return (
        <NativeSelect
            label={"Wells per page"}
            id="wells-per-page-select"
            className={classes.root}
            onChange={onWellsPerPageChange}
            value={wellsPerPage}
        >
            {wellsPerPageOptions.map((value) => (
                <option key={`option-${value}`} value={value}>
                    {value}
                </option>
            ))}
        </NativeSelect>
    );
});

WellsPerPageSelector.displayName = "WellsPerPageSelector";
export default WellsPerPageSelector;
