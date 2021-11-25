import React, { ChangeEvent, FormEvent, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLayerProp } from "../../redux/actions";
import { MapState } from "../../redux/store";
import DrawModeSelector from "./DrawModeSelector";
import NumericInput from "./NumericInput";
import ToggleButton from "./ToggleButton";
import SliderInput from "./SliderInput";
import {
    SliderTypeProps,
    ToggleTypeProps,
    MenuTypeProps,
    NumericTypeProps,
} from "../../redux/types";
import { getLayerProps } from "../../utils/specExtractor";

interface Props {
    layerId: string;
}

const LayerProperty: React.FC<Props> = React.memo(({ layerId }: Props) => {
    // Redux
    const dispatch = useDispatch();
    const layers = useSelector((st: MapState) => st.layers);

    // states
    const [layerProps, setLayerProps] =
        React.useState<Record<string, unknown> | null>(null);

    React.useEffect(() => {
        setLayerProps(getLayerProps(layers, layerId));
    }, [layers, layerId]);

    // handlers
    const updateProp = useCallback(
        (layer_id, prop_name, state) =>
            dispatch(updateLayerProp([layer_id, prop_name, state])),
        [dispatch]
    );

    const isControlDisplayable = (
        propId: string,
        dependentOnProp: string | undefined
    ): boolean => {
        if (!layerProps) return false;

        return dependentOnProp
            ? dependentOnProp in layerProps && propId in layerProps
            : propId in layerProps;
    };

    return (
        layerProps && (
            <>
                {
                    // first render all boolean properties
                    ToggleTypeProps.map(
                        ({ id, displayName, dependentOnProp }) =>
                            isControlDisplayable(id, dependentOnProp) && (
                                <ToggleButton
                                    label={displayName}
                                    checked={layerProps[id] as boolean}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) => {
                                        updateProp(
                                            layerId,
                                            id,
                                            e.target.checked
                                        );
                                    }}
                                    key={`prop-toggle-${layerId}-${id}`}
                                />
                            )
                    )
                }

                {
                    // then render all numeric properties
                    NumericTypeProps.map(
                        ({ id, displayName, dependentOnProp }) =>
                            isControlDisplayable(id, dependentOnProp) && (
                                <NumericInput
                                    label={displayName}
                                    value={layerProps[id] as number}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) => {
                                        updateProp(
                                            layerId,
                                            id,
                                            Number(e.target.value)
                                        );
                                    }}
                                    key={`prop-numeric-input-${layerId}-${id}`}
                                />
                            )
                    )
                }

                {
                    // then render all slider properties
                    SliderTypeProps.map(
                        ({
                            id,
                            displayName,
                            min,
                            max,
                            step,
                            dependentOnProp,
                        }) =>
                            isControlDisplayable(id, dependentOnProp) && (
                                <SliderInput
                                    label={displayName}
                                    min={min}
                                    max={max}
                                    step={step}
                                    value={layerProps[id] as number}
                                    onChange={(
                                        _: FormEvent<HTMLDivElement>,
                                        value: number | number[]
                                    ) => {
                                        updateProp(
                                            layerId,
                                            id,
                                            (value as number) / 100
                                        );
                                    }}
                                    key={`prop-slider-${layerId}-${id}`}
                                />
                            )
                    )
                }

                {
                    // lastly render all menu type properties
                    MenuTypeProps.map(
                        ({ id, displayName, dependentOnProp }) =>
                            isControlDisplayable(id, dependentOnProp) && (
                                <DrawModeSelector
                                    layerId={layerId}
                                    label={displayName}
                                    value={layerProps[id] as string}
                                    key={`prop-menu-${layerId}-${id}`}
                                />
                            )
                    )
                }
            </>
        )
    );
});

LayerProperty.displayName = "LayerProperty";
export default LayerProperty;
