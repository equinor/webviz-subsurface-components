import { Checkbox, Icon, Menu, Tooltip } from "@equinor/eds-core-react";
import { createStyles, Fab, makeStyles } from "@material-ui/core";
import React, { ChangeEvent, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateVisibleLayers } from "../../redux/actions";
import { MapState } from "../../redux/store";
import { getLayerVisibility } from "../../utils/specExtractor";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            flexDirection: "column",
            display: "flex",
        },
    })
);
const LayersButton: React.FC = React.memo(() => {
    const classes = useStyles();
    // Redux
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const spec = useSelector((st: MapState) => st.spec);

    const layers = useMemo(() => getLayerVisibility(spec), [spec]);

    // handlers
    const handleClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(anchorEl ? null : event.currentTarget);
        },
        [anchorEl]
    );

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const updateChecked = useCallback(
        (layer, checked) => dispatch(updateVisibleLayers([layer, checked])),
        [dispatch]
    );

    return (
        <>
            <Fab id="layers-selector-button" onClick={handleClick}>
                <Tooltip title="Layers">
                    <Icon color="currentColor" name="layers" />
                </Tooltip>
            </Fab>
            <Menu
                anchorEl={anchorEl}
                aria-labelledby="layers-selector-button"
                id="layers-selector"
                onClose={handleClose}
                placement="left"
                open={Boolean(anchorEl)}
                className={classes.root}
            >
                {Object.keys(layers).map((layer) => (
                    <Checkbox
                        key={`layer-checkbox-${layer}`}
                        label={layer}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            updateChecked(layer, e.target.checked);
                        }}
                        checked={layers[layer]}
                    />
                ))}
            </Menu>
        </>
    );
});

LayersButton.displayName = "LayersButton";
export default LayersButton;
