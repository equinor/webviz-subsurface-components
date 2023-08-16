import React from "react";
import { CircularProgress } from "@mui/material";
import { Layer, LayersList } from "@deck.gl/core/typed";

interface StatusIndicatorProps {
    layers: LayersList;
    isLoaded: boolean;
}

function getLoadProgress(layers: LayersList) {
    const loaded = layers?.filter((layer) => (layer as Layer)?.isLoaded);
    const count = loaded?.length;
    const progress = count / layers?.length;
    return progress * 100;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    layers,
    isLoaded,
}: StatusIndicatorProps) => {
    if (isLoaded) {
        return <div />;
    }
    const progress = getLoadProgress(layers);
    return (
        <div>
            <CircularProgress
                size={48}
                value={progress}
                variant={"determinate"}
            />
            <br />
            Loading assets...
        </div>
    );
};

export default StatusIndicator;
