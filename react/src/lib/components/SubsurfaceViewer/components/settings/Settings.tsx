import { Icon } from "@equinor/eds-core-react";
import { layers } from "@equinor/eds-icons";
import { Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MapState } from "../../redux/store";
import LayersButton from "./LayersButton";
import LayerSettingsButton from "./LayerSettingsButton";
import { getLayersInViewport } from "../../layers/utils/layerTools";

Icon.add({ layers }); // (this needs only be done once)

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: "absolute",
            bottom: theme.spacing(4),
            right: theme.spacing(2),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
    })
);

export interface SettingsProps {
    viewportId?: string;
    layerIds?: string[];
}

const Settings: React.FC<SettingsProps> = React.memo(
    ({ viewportId, layerIds }: SettingsProps) => {
        const classes = useStyles();

        const spec = useSelector((st: MapState) => st.spec);
        const [layersInView, setLayersInView] = useState<
            Record<string, unknown>[]
        >([]);
        useEffect(() => {
            const layers_in_viewport = getLayersInViewport(
                spec["layers"] as Record<string, unknown>[],
                layerIds
            ) as Record<string, unknown>[];
            setLayersInView(layers_in_viewport);
        }, [spec, layerIds]);

        if (!layersInView?.length) return null;
        return (
            <div className={classes.root}>
                {layersInView.map(
                    (layer) =>
                        layer && (
                            <LayerSettingsButton
                                layer={layer}
                                key={`layer-settings-button-${layer["id"]}-${viewportId}`}
                            />
                        )
                )}
                <LayersButton
                    id={`layers-button-${viewportId}`}
                    layers={layersInView}
                />
            </div>
        );
    }
);

Settings.displayName = "Settings";
export default Settings;
