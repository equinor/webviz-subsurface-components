import { LayersList, Layer } from "@deck.gl/core/typed";
import Map, {
    ViewsType,
    TooltipCallback,
    ViewStateType,
    BoundsAccessor,
} from "./components/Map";
import { MapMouseEvent, jsonToObject } from "./components/Map";
import React from "react";
import PropTypes from "prop-types";
import { colorTablesArray } from "@emerson-eps/color-tables/";
import convert, { Unit } from "convert-units";

export interface SubsurfaceViewerProps {
    id: string;
    resources?: Record<string, unknown>;
    layers?: Record<string, unknown>[] | LayersList;
    bounds?: [number, number, number, number] | BoundsAccessor;
    views?: ViewsType;
    coords?: {
        visible?: boolean | null;
        multiPicking?: boolean | null;
        pickDepth?: number | null;
    };
    scale?: {
        visible?: boolean | null;
        incrementValue?: number | null;
        widthPerUnit?: number | null;
        cssStyle?: Record<string, unknown> | null;
    };
    coordinateUnit?: Unit;
    toolbar?: {
        visible?: boolean | null;
    };
    legend?: {
        visible?: boolean | null;
        cssStyle?: Record<string, unknown> | null;
        horizontal?: boolean | null;
    };
    colorTables?: colorTablesArray;
    editedData?: Record<string, unknown>;
    setProps?: (data: Record<string, unknown>) => void;

    /**
     * Validate JSON datafile against schema
     */
    checkDatafileSchema?: boolean;

    /**
     * For get mouse events
     */
    onMouseEvent?: (event: MapMouseEvent) => void;

    getCameraPosition?: (input: ViewStateType) => void;

    /**
     * If changed will reset camera to default position.
     */
    triggerHome?: number;
    triggerResetMultipleWells?: number;
    /**
     * Range selection of the current well
     */
    selection?: {
        well: string | undefined;
        selection: [number | undefined, number | undefined] | undefined;
    };

    /**
     * Override default tooltip with a callback.
     */
    getTooltip?: TooltipCallback;
    cameraPosition?: ViewStateType | undefined;

    children?: React.ReactNode;
}

const SubsurfaceViewer: React.FC<SubsurfaceViewerProps> = ({
    id,
    resources,
    layers,
    bounds,
    views,
    coords,
    scale,
    coordinateUnit,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    legend,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toolbar,
    colorTables,
    editedData,
    setProps,
    checkDatafileSchema,
    onMouseEvent,
    selection,
    getTooltip,
    cameraPosition,
    getCameraPosition,
    triggerHome,
    triggerResetMultipleWells,
    children,
}: SubsurfaceViewerProps) => {
    // Contains layers data received from map layers by user interaction
    const [layerEditedData, setLayerEditedData] = React.useState(editedData);

    const [layerInstances, setLayerInstances] = React.useState<LayersList>([]);

    React.useEffect(() => {
        if (!layers) {
            setLayerInstances([]);
            return;
        }

        if (layers?.[0] instanceof Layer) {
            setLayerInstances(layers as LayersList);
            return;
        }

        const enumerations: Record<string, unknown>[] = [];
        if (resources) enumerations.push({ resources: resources });
        if (editedData) enumerations.push({ editedData: editedData });
        else enumerations.push({ editedData: {} });
        const layersList = jsonToObject(
            layers as Record<string, unknown>[],
            enumerations
        ) as LayersList;
        setLayerInstances(layersList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layers]); // Note. Fixing this dependency list may cause infinite recursion.
    React.useEffect(() => {
        if (!editedData) return;

        setLayerEditedData({
            ...layerEditedData,
            ...editedData,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editedData]); // Note. Fixing this dependency list may cause infinite recursion.

    // This callback is used as a mechanism to update the component from the layers or toolbar.
    // The changes done in a layer, for example, are bundled into a patch
    // and sent to the parent component via setProps. (See layers/utils/layerTools.ts)
    const setEditedData = React.useCallback(
        (data: Record<string, unknown>) => {
            if (setProps == undefined) return;
            setProps({
                editedData: {
                    ...layerEditedData,
                    ...data,
                },
            });
        },
        [setProps, layerEditedData]
    );

    if (coordinateUnit && !convert().possibilities().includes(coordinateUnit)) {
        console.error(
            `Invalid coordinate unit: '${coordinateUnit}'. Valid units are: ${convert().possibilities()}`
        );
        coordinateUnit = undefined;
    }

    return (
        <Map
            id={id}
            layers={layerInstances}
            bounds={bounds}
            views={views}
            coords={coords}
            scale={scale}
            coordinateUnit={coordinateUnit as Unit}
            colorTables={colorTables}
            setEditedData={setEditedData}
            checkDatafileSchema={checkDatafileSchema}
            onMouseEvent={onMouseEvent}
            selection={selection}
            getTooltip={getTooltip}
            cameraPosition={cameraPosition}
            getCameraPosition={getCameraPosition}
            triggerHome={triggerHome}
            triggerResetMultipleWells={triggerResetMultipleWells}
        >
            {children}
        </Map>
    );
};

SubsurfaceViewer.defaultProps = {
    views: {
        layout: [1, 1],
        marginPixels: 0,
        showLabel: false,
        viewports: [{ id: "main-view", show3D: false, layerIds: [] }],
    },
    checkDatafileSchema: false,
};

export default SubsurfaceViewer;
