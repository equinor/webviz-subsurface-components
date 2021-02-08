import { Search } from "@equinor/eds-core-react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { throttle } from "lodash";
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateWellSearchText } from "../../redux/reducer";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            marginRight: "2rem",
            marginTop: theme.spacing(1),
        },
    })
);
const WellFilter: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    // handlers
    const onChange = useCallback(
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
        <div className={classes.root}>
            <Search
                aria-label="sitewide"
                id="search-well-name"
                placeholder="Search well names"
                onChange={onChange}
            />
        </div>
    );
});

WellFilter.displayName = "WellFilter";
export default WellFilter;
