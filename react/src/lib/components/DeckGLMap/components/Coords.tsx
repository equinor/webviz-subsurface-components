import React from "react";
import { PickInfo } from "deck.gl";
import { PropertyMapPickInfo } from "../layers/utils/propertyMapTools";

interface CoordsInfo {
    x: number;
    y: number;
    z: {
        value: number;
        layerId: string;
    }[];
}

export interface CoordsProps {
    pickInfos: PickInfo<unknown>[];
}

const Coords: React.FC<CoordsProps> = (props: CoordsProps) => {
    const [coordsInfo, setCoordsInfo] = React.useState<CoordsInfo | null>(null);

    React.useEffect(() => {
        if (props.pickInfos.length === 0) {
            setCoordsInfo(null);
            return;
        }

        const topObject = props.pickInfos[0];
        if (
            topObject.coordinate === undefined ||
            topObject.coordinate.length < 2
        ) {
            setCoordsInfo(null);
            return;
        }

        const coordsInfo: CoordsInfo = {
            x: topObject.coordinate[0],
            y: topObject.coordinate[1],
            z: [],
        };

        props.pickInfos.forEach((info) => {
            const zValue = (info as PropertyMapPickInfo).propertyValue;
            if (zValue) {
                coordsInfo.z.push({
                    value: zValue,
                    layerId: info.layer.id || "unknown-layer",
                });
            }
        });

        setCoordsInfo(coordsInfo);
    }, [props.pickInfos]);

    return (
        coordsInfo && (
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
                x: {coordsInfo.x.toFixed(0)}
                <br />
                y: {coordsInfo.y.toFixed(0)}
                <br />
                {coordsInfo.z.map(({ value, layerId }, index) => (
                    <span key={index.toString()}>
                        {layerId}: {value.toFixed(2)}
                        <br />
                    </span>
                ))}
            </div>
        )
    );
};
export default Coords;
