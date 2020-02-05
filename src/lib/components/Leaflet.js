import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import sideBySide from "../private_components/leaflet-resources/side-by-side/leaflet-side-by-side"

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

function Leaflet({
    id,
    options,
    baseLayer,
    width,
    height,
    simpleCRS
}) {
    const mapOptions = {
        layers: [],
        bounds: [
            [0, 0],
            [1000, 1000],
        ],
        center: [500, 500],
        zoom: 0,
        maxZoom: 10,
        maxBounds: null,
        noWrap: true,
        ...options,
    };
    const mapRef = useRef(null);
    const baseLayers = useRef(null);
    const overlayLayers = useRef(null);
    const style = { width: width, height: height };

    // create map
    useEffect(() => {
        mapRef.current = L.map(id, {
        ...mapOptions,
        crs: (simpleCRS ? L.CRS.Simple: L.CRS.EPSG3857 )
        });
    });

    // add layer groups
    useEffect(() => {
        baseLayers.current = L.layerGroup().addTo(mapRef.current);
        overlayLayers.current = L.layerGroup().addTo(mapRef.current);
    });

    //Set baselayer
    useEffect(() => {
        if (baseLayer.type === "tiles") {
            baseLayers.current.clearLayers();
            L.tileLayer(baseLayer.url, {
                attribution:
                    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(baseLayers.current);
        }

        if (baseLayer.type === "tiles_sidebyside") {
            baseLayers.current.clearLayers();
            var layer = L.tileLayer(baseLayer.url_left, {
                attribution:
                    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(baseLayers.current);
            var layer2 = L.tileLayer(baseLayer.url_right, {
                attribution:
                    '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(baseLayers.current);
            
            L.control.sideBySide(layer, layer2).addTo(mapRef.current);
        }

        const bounds = (baseLayer.hasOwnProperty('bounds') ? baseLayer.bounds : mapOptions.bounds)
        if (baseLayer.type === "image") {
            baseLayers.current.clearLayers();
            L.imageOverlay(baseLayer.url, bounds, {}).addTo(
                baseLayers.current
            );
        }

        if (baseLayer.type === "image_sidebyside") {
            baseLayers.current.clearLayers();
            mapRef.current.createPane('left');
            mapRef.current.createPane('right');
            const layer = L.imageOverlay(baseLayer.url_left, bounds, {pane:'left'}).addTo(
                baseLayers.current
            );
            const layer2 = L.imageOverlay(baseLayer.url_right, bounds, {pane:'right'}).addTo(
                baseLayers.current
            );
            
            L.control.sideBySide(layer, layer2).addTo(mapRef.current);
        }
    }, [baseLayer]);

    return <div id={id} style={style}></div>;
}
Leaflet.defaultProps = {
    width: "100%",
    height: "800px",
    options: {},
    simpleCRS: false    
};
Leaflet.propTypes = {
    id: PropTypes.string,
    //Map Options
    options: PropTypes.object,
    baseLayer: PropTypes.object,
    width: PropTypes.string,
    height: PropTypes.string,
    simpleCRS: PropTypes.bool
};

export default Leaflet;
