import React from "react";

import { JSONConfiguration, JSONConverter } from "@deck.gl/json";
import DeckGL from "@deck.gl/react";

import JSON_CONVERTER_CONFIGURATION from "./configuration";

export interface MapProps {
    id: string;
    jsonData: object;
}

const Map: React.FC<MapProps> = (props: MapProps) => {
    const [jsonProps, setJsonProps] = React.useState(null);
    React.useEffect(() => {
        const configuration = new JSONConfiguration(
            JSON_CONVERTER_CONFIGURATION
        );
        const jsonConverter = new JSONConverter({ configuration });

        setJsonProps(jsonConverter.convert(props.jsonData));
    }, [props.jsonData]);

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            {jsonProps && <DeckGL id={props.id} {...jsonProps} />}
        </div>
    );
};

export default Map;
