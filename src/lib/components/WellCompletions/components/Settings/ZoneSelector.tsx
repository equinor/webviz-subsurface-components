import {
    Checkbox,
    createStyles,
    FormControl,
    Input,
    InputLabel,
    ListItemText,
    makeStyles,
    MenuItem,
    Select,
    // eslint-disable-next-line prettier/prettier
    Theme
} from "@material-ui/core";
import React, { useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFilteredZones } from "../../redux/actions";
import { WellCompletionsState } from "../../redux/store";
import { DataContext } from "../DataLoader";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            padding: theme.spacing(1),
            width: "150px",
        },
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
            maxWidth: 250,
        },
    })
);
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const ZoneSelector: React.FC = React.memo(() => {
    const classes = useStyles();
    const data = useContext(DataContext);
    // Redux
    const dispatch = useDispatch();
    const filteredZones = useSelector(
        (st: WellCompletionsState) => st.ui.filteredZones
    );
    const stratigraphy = useMemo(
        () => data.stratigraphy.map((zone) => zone.name),
        [data]
    );
    // handlers
    const handleSelectionChange = useCallback(
        (event) => dispatch(updateFilteredZones(event.target.value)),
        [dispatch]
    );
    return (
        <FormControl className={classes.formControl}>
            <InputLabel id="mutiple-zone-label">Select Zones</InputLabel>
            <Select
                labelId="mutiple-zone-label"
                id="demo-mutiple-zone"
                multiple
                value={filteredZones}
                onChange={handleSelectionChange}
                input={<Input />}
                renderValue={(selected) => (selected as string[]).join(", ")}
                MenuProps={MenuProps}
                style={{ width: "230px" }}
            >
                {stratigraphy.map((name) => (
                    <MenuItem key={name} value={name}>
                        <Checkbox checked={filteredZones.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
});

ZoneSelector.displayName = "ZoneSelector";
export default ZoneSelector;
