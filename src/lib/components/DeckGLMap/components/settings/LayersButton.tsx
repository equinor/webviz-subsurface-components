import { Checkbox, Icon, Menu, Tooltip } from "@equinor/eds-core-react";
import { layers } from "@equinor/eds-icons";
import {
    createStyles,
    Fab,
    makeStyles,
    Theme,
    // eslint-disable-next-line prettier/prettier
    useTheme
} from "@material-ui/core";
import { isEmpty } from "lodash";
import React, { ChangeEvent, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateVisibleLayers } from "../../redux/actions";
import { MapState } from "../../redux/store";

Icon.add({ layers }); // (this needs only be done once)

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        fab: {
            position: "absolute",
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
    })
);
const LayersButton: React.FC = React.memo(() => {
    const classes = useStyles();
    const theme = useTheme();
    // Redux
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const spec = useSelector((st: MapState) => st.spec);

    const layers = useMemo(
        () =>
            !isEmpty(spec)
                ? (spec.layers as any).reduce(
                      (acc, current) => ({
                          ...acc,
                          [current.id]:
                              current.visible === undefined || current.visible,
                      }),
                      {}
                  )
                : {},
        [spec]
    );

    // handlers
    const handleOpen = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchorEl(event.currentTarget);
        },
        []
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
            <Fab
                onClick={handleOpen}
                className={classes.fab}
                id="layers-selector-button"
            >
                <Tooltip title="Layers">
                    <Icon color="currentColor" name="layers" />
                </Tooltip>
            </Fab>
            <Menu
                anchorEl={anchorEl}
                aria-labelledby="layers-selector-button"
                id="layers-selector"
                onClose={handleClose}
                placement="bottom-end"
                open={Boolean(anchorEl)}
            >
                {Object.keys(layers).map((layer) => (
                    <Menu.Item
                        key={`layer-checkbox-menu-${layer}`}
                        style={{
                            padding: 0,
                            paddingRight: theme.spacing(1),
                        }}
                    >
                        <Checkbox
                            key={`layer-checkbox-${layer}`}
                            label={layer}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                updateChecked(layer, e.target.checked);
                            }}
                            checked={layers[layer]}
                        />
                    </Menu.Item>
                ))}
            </Menu>
        </>
    );
});

LayersButton.displayName = "LayersButton";
export default LayersButton;
