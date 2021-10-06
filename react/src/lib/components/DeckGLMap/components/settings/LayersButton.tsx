import { Icon, Menu, Tooltip } from "@equinor/eds-core-react";
import { createStyles, Fab, makeStyles } from "@material-ui/core";
import React, { ChangeEvent, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateVisibleLayers } from "../../redux/actions";
import { MapState } from "../../redux/store";
import { getLayerVisibility } from "../../utils/specExtractor";
import { isEmpty } from "lodash";
import ToggleButton from "./ToggleButton";

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

    const layers_visiblity = useMemo(() => getLayerVisibility(spec), [spec]);

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

    if (isEmpty(spec) || !("layers" in spec)) return null;
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
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(spec["layers"] as any[]).map((layer) => (
                    <ToggleButton
                        label={layer.name}
                        checked={layers_visiblity[layer.id]}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            updateChecked(layer.id, e.target.checked);
                        }}
                        key={`layer-toggle-${layer.id}`}
                    />
                ))}
            </Menu>
        </>
    );
});

LayersButton.displayName = "LayersButton";
export default LayersButton;
