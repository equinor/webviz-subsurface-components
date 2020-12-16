import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import mapboxgl from "mapbox-gl";

import "./mapbox-map.css";

function MapboxMap(props) {
    const [lng, setLng] = useState(5);
    const [lat, setLat] = useState(34);
    const [zoom, setZoom] = useState(2);

    const [map, setMap] = useState(null);

    const mapRef = useRef(null);

    useEffect(() => {
        // Public token
        mapboxgl.accessToken =
            "pk.eyJ1IjoiYWFsZXhhbmRydSIsImEiOiJja2llYTExYzMwenk4MnhvNWZtZ3Nja2hnIn0.wh7XeMs7Eec598UMcNOb5A";

        if (!map) {
            const map = new mapboxgl.Map({
                container: mapRef.current,
                style: props.mapStyle,
                center: [lng, lat],
                zoom: zoom,
            });

            map.on("load", () => {
                setMap(map);
                map.resize();
            });

            map.on("move", () => {
                setLng(map.getCenter().lng.toFixed(4));
                setLat(map.getCenter().lat.toFixed(4));
                setZoom(map.getZoom().toFixed(2));
            });
        }
    }, [map]);

    if (map) {
        map.setStyle(props.mapStyle);
    }

    return (
        <div>
            <div ref={mapRef} className="mapContainer">
                <div className="sidebarStyle">
                    <div>
                        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
                    </div>
                </div>
            </div>
        </div>
    );
}

MapboxMap.propTypes = {
    mapStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
        .isRequired,
};

export default MapboxMap;
