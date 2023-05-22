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
        (
            layer_id: string,
            prop_name: string,
            state: string | number | boolean
        ) => dispatch(updateLayerProp([layer_id, prop_name, state])),
        [dispatch]
    );

    const isControlDisplayable = (
        propId: string,
        dependentOnProp?: string
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
                        (prop) =>
                            isControlDisplayable(
                                prop.id,
                                prop.dependentOnProp
                            ) && (
                                <ToggleButton
                                    label={prop.displayName}
                                    checked={layer[prop.id] as boolean}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) => {
                                        updateProp(
                                            layer["id"] as string,
                                            prop.id,
                                            e.target.checked
                                        );
                                    }}
                                    key={`prop-toggle-${layer["id"]}-${prop.id}`}
                                />
                            )
                    )
                }

                {
                    // then render all numeric properties
                    NumericTypeProps.map(
                        (prop) =>
                            isControlDisplayable(
                                prop.id,
                                prop.dependentOnProp
                            ) && (
                                <NumericInput
                                    label={prop.displayName}
                                    value={layer[prop.id] as number}
                                    step={prop.step}
                                    onChange={(
                                        e: ChangeEvent<HTMLInputElement>
                                    ) => {
                                        updateProp(
                                            layer["id"] as string,
                                            prop.id,
                                            Number(e.target.value)
                                        );
                                    }}
                                    key={`prop-numeric-input-${layer["id"]}-${prop.id}`}
                                />
                            )
                    )
                }

                {
                    // then render all slider properties
                    SliderTypeProps.map(
                        (prop) =>
                            isControlDisplayable(
                                prop.id,
                                prop.dependentOnProp
                            ) && (
                                <SliderInput
                                    label={prop.displayName}
                                    min={prop.min}
                                    max={prop.max}
                                    step={prop.step}
                                    value={layer[prop.id] as number}
                                    onChange={(
                                        _: FormEvent<HTMLDivElement>,
                                        value: number | number[]
                                    ) => {
                                        updateProp(
                                            layer["id"] as string,
                                            prop.id,
                                            (value as number) / 100
                                        );
                                    }}
                                    key={`prop-slider-${layer["id"]}-${prop.id}`}
                                />
                            )
                    )
                }

                {
                    // lastly render all menu type properties
                    MenuTypeProps.map(
                        (prop) =>
                            isControlDisplayable(
                                prop.id,
                                prop.dependentOnProp
                            ) && (
                                <DrawModeSelector
                                    layerId={layer["id"] as string}
                                    label={prop.displayName}
                                    value={layer[prop.id] as string}
                                    key={`prop-menu-${layer["id"]}-${prop.id}`}
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
