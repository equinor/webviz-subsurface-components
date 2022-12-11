import React from "react";
import Widgets from "./components/Widgets";
// deck.gl imports
import DeckGL from "@deck.gl/react/typed";
import { COORDINATE_SYSTEM } from "@deck.gl/core/typed";
import { DeckLayer } from "@deck.gl/arcgis";
import { GeoJsonLayer, PolygonLayer } from "@deck.gl/layers/typed";
// arcgis imports
// import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";
import MapView from "@arcgis/core/views/MapView";
import ArcGISMap from "@arcgis/core/Map";
import "@arcgis/core/assets/esri/themes/light/main.css";
import { arcgisToGeoJSON } from "@esri/arcgis-to-geojson-utils";
// import Map from "@arcgis/core/Map";

type LayerProps = {
    fillColor?: any;
    baseMap?: string;
    layerURL: string;
    zoom?: number;
};

const VIEW_STATE_TEMPLATE = {
    longitude: 0,
    latitude: 0,
    zoom: 0,
    pitch: 0,
    bearing: 0,
};

export default function ArcGisLayer({
    fillColor = [255, 0, 0],
    baseMap = "topographic",
    layerURL,
    zoom = 8,
}: LayerProps): JSX.Element {
    const mapRef = React.useRef<string | HTMLDivElement | undefined>();
    const [view, setView] = React.useState(new MapView({}));
    const [layer, setLayer] = React.useState(new GeoJsonLayer());

    // getting the data
    React.useEffect(() => {
        fetch(layerURL)
            .then((response) => response.json())
            .then((geojson) => {
                console.log("data", geojson);
                const isGeojson = layerURL.toLowerCase().includes("geojson");

                const blobURL = new Blob([JSON.stringify(geojson)], {
                    type: "application/json",
                });
                const url = URL.createObjectURL(blobURL);

                // deck.gl layer
                let subLayer, center: number[], dataName: string;

                const convertedGeojson = new arcgisToGeoJSON(geojson);
                // console.log("url", url);
                if (isGeojson) {
                    console.log("geo");
                    console.log("geojson", geojson);
                    center =
                        geojson["features"][0]["geometry"]["coordinates"][0][0];
                    dataName = geojson["features"][0]["properties"]["fldName"];
                    subLayer = new GeoJsonLayer({
                        id: dataName,
                        data: url,
                        filled: true,
                        pickable: true,
                        stroked: true,
                        pointType: "circle",
                        extruded: false,
                        lineWidthScale: 20,
                        lineWidthMinPixels: 2,
                        getFillColor: fillColor,
                        getLineWidth: 3,
                        getLineColor: [255, 255, 255],
                        // getPointRadius: 100,
                        // getElevation: 30,
                        getText: () => dataName,
                    });
                } else {
                    console.log("poly");
                    console.log("convertedGeojson", convertedGeojson);
                    center = geojson["features"][0]["geometry"]["rings"][0][0];
                    // center = geojson[0]["contour"][0];
                    dataName = geojson["features"][0]["attributes"]["fldName"];
                    // dataName = geojson[0]["zipcode"];
                    // geojson = [geojson];
                    subLayer = new PolygonLayer({
                        id: dataName,
                        data: url,
                        filled: true,
                        pickable: true,
                        stroked: true,
                        pointType: "circle",
                        extruded: false,
                        lineWidthScale: 20,
                        lineWidthMinPixels: 2,
                        getFillColor: fillColor,
                        getLineWidth: 3,
                        getLineColor: [255, 255, 255, 0],
                        coordinateOrigin: [6, 38.85, 0],
                        coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
                        getPolygon: (d) => {
                            console.log("d", d);
                            return d["features"][0]["geometry"]["rings"];
                        },
                    });
                }

                const deckLayer = new DeckLayer({
                    "deck.layers": [subLayer],
                });
                // arcgis base-map
                const arcgisMap = new ArcGISMap({
                    basemap: baseMap,
                    // basemap: "topography",
                    layers: [deckLayer],
                });
                new MapView({
                    container: mapRef?.current,
                    map: arcgisMap,
                    center,
                    zoom,
                }).when(
                    (view: any) => setView(view),
                    (cbErr: any) => console.log(cbErr)
                );
            })
            .catch((error) => console.log(error));
    }, [zoom, baseMap, layerURL, fillColor]);

    return (
        <div
            ref={mapRef as React.RefObject<HTMLDivElement>}
            style={{ height: "90vh", width: "100%" }}
        >
            {view && <Widgets view={view} />}
        </div>
    );
}
