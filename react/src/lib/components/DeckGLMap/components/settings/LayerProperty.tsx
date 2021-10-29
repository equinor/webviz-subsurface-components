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
    const spec = useSelector((st: MapState) => st.spec);

    // states
    const [layerProps, setLayerProps] =
        React.useState<Record<string, unknown> | null>(null);

    React.useEffect(() => {
        setLayerProps(getLayerProps(spec, layerId));
    }, [spec, layerId]);

    // handlers
    const updateProp = useCallback(
        (layer_id, prop_name, state) =>
            dispatch(updateLayerProp([layer_id, prop_name, state])),
        [dispatch]
    );

    return (
        layerProps && (
            <>
                {
                    // first render all boolean properties
                    ToggleTypeProps.map(
                        ({ id, displayName }) =>
                            id in layerProps && (
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
                        ({ id, displayName }) =>
                            id in layerProps && (
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
                        ({ id, displayName, min, max, step }) =>
                            id in layerProps && (
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
                        ({ id, displayName }) =>
                            id in layerProps && (
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
