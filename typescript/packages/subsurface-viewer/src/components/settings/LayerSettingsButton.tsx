/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import { Icon, Menu, Tooltip } from "@equinor/eds-core-react";
import { styled } from "@mui/material/styles";
import { Fab } from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { LayerIcons, LayerType } from "../../redux/types";
import { getPropVisibility } from "../../utils/specExtractor";
import LayerProperty from "./LayerProperty";
import { useDispatch } from "react-redux";
import { updateLayerProp } from "../../redux/actions";

const PREFIX = "LayerSettingsButton";

const classes = {
    root: `${PREFIX}-root`,
    menu: `${PREFIX}-menu`,
};

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.root}`]: {
        marginBottom: theme.spacing(1),
    },

    [`& .${classes.menu}`]: {
        display: "flex",
        flexDirection: "column",
    },
}));

interface Props {
    layer: Record<string, unknown>;
}

const LayerSettingsButton: React.FC<Props> = React.memo(({ layer }: Props) => {
    const dispatch = useDispatch();

    // handlers
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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

    const propVisibility = useMemo(() => getPropVisibility(layer), [layer]);
    if (
        !LayerIcons[layer["@@type"] as LayerType] ||
        !layer["visible"] ||
        !propVisibility
    )
        return null;

    return (
        <Root>
            <Fab
                id={`${layer["id"]}-button`}
                size="medium"
                onClick={handleClick}
                className={classes.root}
            >
                <Tooltip title={layer["name"] as string}>
                    <Icon
                        color="currentColor"
                        name={LayerIcons[layer["@@type"] as LayerType]}
                    />
                </Tooltip>
            </Fab>
            <Menu
                className={classes.menu}
                anchorEl={anchorEl}
                aria-labelledby={`${layer["id"]}-button`}
                onClose={handleClose}
                placement="left"
                open={Boolean(anchorEl)}
            >
                <LayerProperty
                    layer={layer}
                    key={`layer-property-${layer["id"]}`}
                />
            </Menu>
        </Root>
    );
});

LayerSettingsButton.displayName = "LayerSettingsButton";
export default LayerSettingsButton;
