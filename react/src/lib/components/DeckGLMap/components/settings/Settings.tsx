import { Icon } from "@equinor/eds-core-react";
import { layers } from "@equinor/eds-icons";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MapState } from "../../redux/store";
import LayersButton from "./LayersButton";
import LayerSettingsButton from "./LayerSettingsButton";
import { getLayersInViewport } from "../../layers/utils/layerTools";
import { ViewsType } from "../DeckGLWrapper";

Icon.add({ layers }); // (this needs only be done once)

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: "absolute",
            bottom: theme.spacing(2),
            right: theme.spacing(2),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        },
    })
);

export interface SettingsProps {
    viewportId?: string;
}

const Settings: React.FC<SettingsProps> = React.memo(
    ({ viewportId }: SettingsProps) => {
        const classes = useStyles();

        const spec = useSelector((st: MapState) => st.spec);
        const [layersInView, setLayersInView] = useState<
            Record<string, unknown>[]
        >([]);
        useEffect(() => {
            if (viewportId == undefined) return;

            const layers_in_viewport = getLayersInViewport(
                spec["layers"] as Record<string, unknown>[],
                spec["views"] as ViewsType,
                viewportId
            ) as Record<string, unknown>[];
            setLayersInView(layers_in_viewport);
        }, [spec, viewportId]);

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
