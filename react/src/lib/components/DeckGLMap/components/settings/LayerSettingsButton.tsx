import { Icon, Menu, Tooltip } from "@equinor/eds-core-react";
import { createStyles, Fab, makeStyles, Theme } from "@material-ui/core";
import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { MapState } from "../../redux/store";
import { LayerIcons, LayerType } from "../../redux/types";
import {
    getPropVisibility,
    getLayerVisibility,
} from "../../utils/specExtractor";
import LayerProperty from "./LayerProperty";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            marginBottom: theme.spacing(1),
        },
        menu: {
            display: "flex",
            flexDirection: "column",
        },
    })
);

interface Props {
    /**
     * Layer type defines the icon that should be displayed on the layer settings button.
     */
    layerType: LayerType;
    /**
     * It defines setting options that should be made available based on
     * the unique layer ID, on clicking layer setting button.
     */
    layerId: string;
    /**
     * Layer display name.
     */
    name: string;
}

const LayerSettingsButton: React.FC<Props> = React.memo(
    ({ layerId, layerType, name }: Props) => {
        const classes = useStyles();
        const spec = useSelector((st: MapState) => st.spec);
        const layerVisibility = useMemo(() => getLayerVisibility(spec), [spec]);
        const propVisibility = useMemo(
            () => getPropVisibility(spec, layerId),
            [spec, layerId]
        );
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

        if (
            !LayerIcons[layerType] ||
            !layerVisibility[layerId] ||
            !propVisibility
        )
            return null;

        return (
            <>
                <Fab
                    id={`${layerId}-button`}
                    size="medium"
                    onClick={handleClick}
                    className={classes.root}
                >
                    <Tooltip title={name}>
                        <Icon
                            color="currentColor"
                            name={LayerIcons[layerType]}
                        />
                    </Tooltip>
                </Fab>
                <Menu
                    className={classes.menu}
                    anchorEl={anchorEl}
                    aria-labelledby={`${layerId}-button`}
                    onClose={handleClose}
                    placement="left"
                    open={Boolean(anchorEl)}
                >
                    <LayerProperty
                        layerId={layerId}
                        key={`layer-property-${layerId}`}
                    />
                </Menu>
            </>
        );
    }
);

LayerSettingsButton.displayName = "LayerSettingsButton";
export default LayerSettingsButton;
