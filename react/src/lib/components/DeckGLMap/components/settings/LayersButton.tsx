import { Icon, Menu, Tooltip } from "@equinor/eds-core-react";
import { createStyles, Fab, makeStyles } from "@material-ui/core";
import React, { ChangeEvent, useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateLayerProp, updateVisibleLayers } from "../../redux/actions";
import ToggleButton from "./ToggleButton";

const useStyles = makeStyles(() =>
    createStyles({
        root: {
            flexDirection: "column",
            display: "flex",
        },
    })
);

export interface LayersButtonProps {
    id: string;
    layers: Record<string, unknown>[];
}

const LayersButton: React.FC<LayersButtonProps> = React.memo(
    ({ id, layers }: LayersButtonProps) => {
        const classes = useStyles();
        // Redux
        const dispatch = useDispatch();
        const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(
            null
        );

        // handlers
        const handleClick = useCallback(
            (event: React.MouseEvent<HTMLButtonElement>) => {
                // hack to disable click propagation on drawing layer
                dispatch(updateLayerProp(["drawing-layer", "mode", "view"]));

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

        if (!layers.length) return null;
        return (
            <div id={id}>
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
                    {(
                        layers.slice().reverse() as Record<string, unknown>[]
                    ).map((layer) => (
                        <ToggleButton
                            label={layer["name"] as string}
                            checked={layer["visible"] as boolean}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                updateChecked(layer["id"], e.target.checked);
                            }}
                            key={`layer-toggle-${layer["id"]}`}
                        />
                    ))}
                </Menu>
            </div>
        );
    }
);

LayersButton.displayName = "LayersButton";
export default LayersButton;
