import { NativeSelect } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import { Theme } from "@mui/material";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateWellsPerPage } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";

const PREFIX = "WellsPerPageSelector";

const classes = {
    root: `${PREFIX}-root`,
};

const StyledNativeSelect = styled(NativeSelect)(({ theme: Theme }) => ({
    [`&.${classes.root}`]: {
        padding: theme.spacing(1),
        maxWidth: "170px",
    },
}));

const wellsPerPageOptions = [10, 25, 50];
/**
 * A drop down for selecting how many wells to display per page
 */
const WellsPerPageSelector: React.FC = React.memo(() => {
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
        <StyledNativeSelect
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
        </StyledNativeSelect>
    );
});

WellsPerPageSelector.displayName = "WellsPerPageSelector";
export default WellsPerPageSelector;
