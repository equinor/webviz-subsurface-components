import { NativeSelect } from "@equinor/eds-core-react";
import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { updateDrawingMode } from "../../redux/actions";
import { DrawMode, DrawModes } from "../../redux/types";

interface Props {
    /**
     * It defines the mode that are available for a particular layer based on layer ID.
     */
    layerId: string;
    /**
     * Label for the component.
     */
    label: string;
    /**
     * Initial state of the component.
     */
    value: string;
}

const DrawModeSelector: React.FC<Props> = React.memo(
    ({ layerId, label, value }: Props) => {
        // Redux
        const dispatch = useDispatch();

        // handlers
        const handleSelectedItemChange = useCallback(
            (event) => {
                const selection = DrawModes.find(
                    (mode) => mode.displayName === event.target.value
                );
                dispatch(
                    updateDrawingMode([layerId, selection?.id as DrawMode])
                );
            },
            [dispatch]
        );
        const cur_selection = DrawModes.find((mode) => mode.id === value);
        return (
            <NativeSelect
                id={`${layerId}-mode-selector`}
                label={label}
                value={cur_selection?.displayName}
                onChange={handleSelectedItemChange}
            >
                {DrawModes.map((mode) => (
                    <option key={mode.id}>{mode.displayName}</option>
                ))}
            </NativeSelect>
        );
    }
);

DrawModeSelector.displayName = "DrawModeSelector";
export default DrawModeSelector;
