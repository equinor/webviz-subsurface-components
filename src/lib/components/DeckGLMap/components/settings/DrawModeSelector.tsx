import { NativeSelect } from "@equinor/eds-core-react";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateDrawingMode } from "../../redux/actions";
import { MapState } from "../../redux/store";
import { DrawModes } from "../../redux/types";
import { getDrawMode } from "../../utils/specExtractor";

interface Props {
    layerId: string;
}
const DrawModeSelector: React.FC<Props> = React.memo(({ layerId }: Props) => {
    // Redux
    const dispatch = useDispatch();

    const drawMode = useSelector((st: MapState) =>
        getDrawMode(st.spec, layerId)
    );
    // handlers
    const handleSelectedItemChange = useCallback(
        (event) => dispatch(updateDrawingMode([layerId, event.target.value])),
        [dispatch]
    );
    return (
        drawMode && (
            <NativeSelect
                id={`${layerId}-mode-selector`}
                label="Draw Mode"
                value={drawMode}
                onChange={handleSelectedItemChange}
            >
                {DrawModes.map((mode) => (
                    <option key={mode}>{mode}</option>
                ))}
            </NativeSelect>
        )
    );
});

DrawModeSelector.displayName = "DrawModeSelector";
export default DrawModeSelector;
