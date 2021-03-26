import React from "react";

export interface CoordsInfo {
    x: number;
    y: number;
    z?: {
        value: number;
        layerId?: string;
    }[];
}

export interface CoordsProps {
    coordsInfo: CoordsInfo | null;
}

const Coords: React.FC<CoordsProps> = (props: CoordsProps) => {
    if (!props.coordsInfo) {
        return null;
    }

    return (
        <div
            style={{
                backgroundColor: "#ffffffcc",
                border: "2px solid #ccc",
                padding: "3px",
                borderRadius: "5px",

                position: "absolute",
                bottom: 0,
            }}
        >
            x: {props.coordsInfo.x.toFixed(0)}
            <br />
            y: {props.coordsInfo.y.toFixed(0)}
            <br />
            {props.coordsInfo.z &&
                props.coordsInfo.z.map(({ value, layerId }, index) => (
                    <span key={index.toString()}>
                        z: {value.toFixed(2)} {layerId}
                        <br />
                    </span>
                ))}
        </div>
    );
};
export default Coords;
