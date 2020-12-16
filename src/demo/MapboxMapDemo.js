import React from "react";

import MapboxMap from "../lib/components/MapboxMap";

import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

import exampleData from "./example-data/mapbox-map.json";

const MapboxMapDemo = () => {
    const [mapStyleIndex, setMapStyleIndex] = React.useState(0);

    return (
        <div style={{ height: "95%" }}>
            <div
                style={{
                    position: "absolute",
                    zIndex: 1,
                    padding: 10,
                    backgroundColor: "#f0f0f0aa",
                }}
            >
                <FormControl>
                    <InputLabel id="map-style-select-label">
                        Map Style
                    </InputLabel>
                    <Select
                        labelId="map-style-select-label"
                        id="map-style-select"
                        value={mapStyleIndex}
                        onChange={e => {
                            setMapStyleIndex(e.target.value);
                        }}
                    >
                        {exampleData.styles.map((style, index) => {
                            return (
                                <MenuItem key={index.toString()} value={index}>
                                    {style.name}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
            </div>

            <MapboxMap
                key="mapbox-map"
                mapStyle={exampleData.styles[mapStyleIndex].style}
            />
        </div>
    );
};

export default MapboxMapDemo;
