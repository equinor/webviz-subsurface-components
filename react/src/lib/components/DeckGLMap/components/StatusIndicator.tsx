import React from "react";
import { CircularProgress } from "@equinor/eds-core-react";
import { Layer } from "deck.gl";

interface StatusIndicatorProps {
    layers: Layer<unknown>[];
    isLoaded: boolean;
}

function getLoadProgress(layers: Layer<unknown>[]) {
    const loaded = layers?.filter((layer) => layer.isLoaded);
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
