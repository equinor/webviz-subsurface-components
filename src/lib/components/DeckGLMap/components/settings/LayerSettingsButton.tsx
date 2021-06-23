import { Icon, Menu, Tooltip } from "@equinor/eds-core-react";
import { createStyles, Fab, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { MapState } from "../../redux/store";
import { LayerIcons, LayerType } from "../../redux/types";
import { getLayerVisibility } from "../../utils/specExtractor";
import DrawModeSelector from "./DrawModeSelector";
const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            marginBottom: theme.spacing(1),
        },
    })
);
interface Props {
    layerType: LayerType;
    layerId: string;
}
const LayerSettingsButton: React.FC<Props> = React.memo(
    ({ layerId, layerType }: Props) => {
        const classes = useStyles();
        const spec = useSelector((st: MapState) => st.spec);
        const layerVisibility = useMemo(() => getLayerVisibility(spec), [spec]);
        const [anchorEl, setAnchorEl] =
            React.useState<null | HTMLElement>(null);

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

        if (!LayerIcons[layerType] || !layerVisibility[layerId]) return null;
        return (
            <>
                <Fab
                    id={`${layerId}-button`}
                    size="medium"
                    onClick={handleClick}
                    className={classes.root}
                >
                    <Tooltip title={layerId}>
                        <Icon
                            color="currentColor"
                            name={LayerIcons[layerType]}
                        />
                    </Tooltip>
                </Fab>
                <Menu
                    anchorEl={anchorEl}
                    aria-labelledby={`${layerId}-button`}
                    onClose={handleClose}
                    placement="left"
                    open={Boolean(anchorEl)}
                >
                    <DrawModeSelector layerId={layerId} />
                </Menu>
            </>
        );
    }
);

LayerSettingsButton.displayName = "LayerSettingsButton";
export default LayerSettingsButton;
