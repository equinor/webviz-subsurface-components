import * as React from "react";
import * as mapboxgl from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import "./mapbox-map.css";

const MAPBOX_TOKEN =
    "pk.eyJ1IjoiYWFsZXhhbmRydSIsImEiOiJja2llYTExYzMwenk4MnhvNWZtZ3Nja2hnIn0.wh7XeMs7Eec598UMcNOb5A";

type MapboxProps = {
    mapStyle: mapboxgl.Style;
};

function MapboxMap(props: MapboxProps): React.ReactNode {
    const [lng, setLng] = React.useState(5);
    const [lat, setLat] = React.useState(34);
    const [zoom, setZoom] = React.useState(2);

    const [map, setMap] = React.useState<mapboxgl.Map | null>(null);

    const mapRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!map && mapRef.current) {
            const map = new mapboxgl.Map({
                //no prettier
                accessToken: MAPBOX_TOKEN,
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
                setLng(map.getCenter().lng);
                setLat(map.getCenter().lat);
                setZoom(map.getZoom());
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

export default MapboxMap;
