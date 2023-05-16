/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import { Search } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import { Theme } from "@mui/material";
import { throttle } from "lodash";
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateWellSearchText } from "../../redux/actions";

const PREFIX = "WellFilter";

const classes = {
    root: `${PREFIX}-root`,
};

const Root = styled("div")(({ theme: Theme }) => ({
    [`&.${classes.root}`]: {
        padding: theme.spacing(1),
        maxWidth: "250px",
    },
}));

/**
 * A search textfield to search wells by their names
 */
const WellFilter: React.FC = React.memo(() => {
    // Redux
    const dispatch = useDispatch();
    // Handlers
    const onChange = useCallback(
        // Reduce the update frequency to 0.2 second
        throttle(
            (event: React.ChangeEvent<HTMLInputElement>) =>
                dispatch(updateWellSearchText(event.target.value)),
            20,
            {
                trailing: true,
            }
        ),
        [dispatch]
    );

    return (
        <Root className={classes.root}>
            <Search
                aria-label="sitewide"
                id="search-well-name"
                placeholder="Search well names"
                onChange={onChange}
            />
        </Root>
    );
});

WellFilter.displayName = "WellFilter";
export default WellFilter;
