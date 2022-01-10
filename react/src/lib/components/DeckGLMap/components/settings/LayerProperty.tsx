import React, { ChangeEvent, FormEvent, useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateLayerProp } from "../../redux/actions";
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

interface Props {
    layer: Record<string, unknown>;
}

const LayerProperty: React.FC<Props> = React.memo(({ layer }: Props) => {
    // Redux
    const dispatch = useDispatch();

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
        if (!layer) return false;

        return dependentOnProp
            ? dependentOnProp in layer && propId in layer
            : propId in layer;
    };

    return (
        layer && (
            <>
                {
                    // first render all boolean properties
                    ToggleTypeProps.map(
                        ({ id, displayName, dependentOnProp }) =>
                            isControlDisplayable(id, dependentOnProp) && (
                                <ToggleButton
                                    label={displayName}
                                    checked={layer[id] as boolean}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) => {
                                        updateProp(
                                            layer["id"],
                                            id,
                                            e.target.checked
                                        );
                                    }}
                                    key={`prop-toggle-${layer["id"]}-${id}`}
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
                                    value={layer[id] as number}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) => {
                                        updateProp(
                                            layer["id"],
                                            id,
                                            Number(e.target.value)
                                        );
                                    }}
                                    key={`prop-numeric-input-${layer["id"]}-${id}`}
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
                                    value={layer[id] as number}
                                    onChange={(
                                        _: FormEvent<HTMLDivElement>,
                                        value: number | number[]
                                    ) => {
                                        updateProp(
                                            layer["id"],
                                            id,
                                            (value as number) / 100
                                        );
                                    }}
                                    key={`prop-slider-${layer["id"]}-${id}`}
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
                                    layerId={layer["id"] as string}
                                    label={displayName}
                                    value={layer[id] as string}
                                    key={`prop-menu-${layer["id"]}-${id}`}
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
