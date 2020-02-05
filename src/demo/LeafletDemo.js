import React, { Component } from "react";
import Leaflet from "../lib/components/Leaflet";

class LeafletDemo extends Component {

    render() {
    const tileOptions = {center: [60.39, 5.32], zoom:10, maxZoom:16}
    const imageOptions = {bounds:[[0,0],[1000,1000]]}
        return (
            <div
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr " }}
            >
                <div style={{'margin':'5px'}}>
                    <p>Tile Layer </p>
                    <Leaflet
                        id={"leafletimp"}
                        options={tileOptions}
                        height={'200px'}
                        baseLayer={{
                            type: "tiles",
                            url:
                                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                        }}
                    />
                </div>
                <div style={{'margin':'5px'}}>
                <p>Image Layer </p>
                    <Leaflet
                        id={"leafletimp2"}
                        options={imageOptions}
                        simpleCRS={true}
                        height={'200px'}
                        baseLayer={{
                            type: "image",
                            url:
                                "http://0.0.0.0:8000/topupperreek--amplitude_min--20010601_20000101.png",
                        }}
                    />
                </div>
                
                <div style={{'margin':'5px'}}>
                <p>Tile Layer side-by-side</p>
                    <Leaflet
                        id={"leafletimp3"}
                        options={tileOptions}
                        height={'200px'}
                        baseLayer={{
                            type: "tiles_sidebyside",
                            url_left:
                                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                            url_right:
                                'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
                        }}
                    />
                </div>
                <div style={{'margin':'5px'}}>
                <p>Image Layer side-by-side </p>
                    <Leaflet
                        id={"leafletimp4"}
                        options={imageOptions}
                        simpleCRS={true}
                        height={'200px'}
                        baseLayer={{
                            type: "image_sidebyside",
                            url_left:
                                "http://0.0.0.0:8000/topupperreek--amplitude_min--20010601_20000101.png",
                            url_right:
                                "http://0.0.0.0:8000/topupperreek--amplitude_min--20030101_20010601.png"
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default LeafletDemo;
