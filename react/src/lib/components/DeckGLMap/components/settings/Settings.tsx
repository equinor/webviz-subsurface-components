import { Icon } from "@equinor/eds-core-react";
import { layers } from "@equinor/eds-icons";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MapState } from "../../redux/store";
import LayersButton from "./LayersButton";
import LayerSettingsButton from "./LayerSettingsButton";
import { ViewsType, ViewportType } from "../../components/DeckGLWrapper";

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

        const [currentView, setCurrentView] = useState<ViewportType>();
        useEffect(() => {
            if (viewportId == undefined) return;

            const views = spec["views"] as ViewsType;
            const cur_view = views?.viewports?.find((view) =>
                new RegExp("^" + view.id).test(viewportId)
            );
            setCurrentView(cur_view);
        }, [spec["views"]]);

        const [layersInView, setLayersInView] = useState<
            Record<string, unknown>[]
        >([]);
        useEffect(() => {
            const layers = spec["layers"] as Record<string, unknown>[];
            const layers_in_viewport = currentView?.layerIds;
            if (layers_in_viewport && layers_in_viewport.length > 0) {
                const layers_in_view = layers.filter((layer) =>
                    layers_in_viewport.includes(layer["id"] as string)
                );
                setLayersInView(layers_in_view);
            } else {
                setLayersInView(layers);
            }
        }, [spec["layers"], currentView]);

        if (!layersInView?.length) return null;
        return (
            <div className={classes.root}>
                {layersInView.map(
                    (layer) =>
                        layer && (
                            <LayerSettingsButton
                                layer={layer}
                                key={`layer-settings-button-${layer["id"]}-${currentView?.id}`}
                            />
                        )
                )}
                <LayersButton
                    id={`layers-button-${currentView?.id}`}
                    layers={layersInView}
                />
            </div>
        );
    }
);

Settings.displayName = "Settings";
export default Settings;
