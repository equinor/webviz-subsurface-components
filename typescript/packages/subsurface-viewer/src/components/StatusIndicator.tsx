import React from "react";
import { CircularProgress } from "@equinor/eds-core-react";

interface StatusIndicatorProps {
    // progress between 0 and 100
    progress: number | boolean;
    label: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    progress,
    label,
}: StatusIndicatorProps) => {
    if (typeof progress === "boolean") {
        progress = progress ? 100 : 0;
    }
    if (progress >= 100) {
        return null;
    }
    return (
        <div>
            <CircularProgress
                size={48}
                value={progress}
                variant={"determinate"}
            />
            <br />
            {label}
        </div>
    );
};

export default StatusIndicator;
