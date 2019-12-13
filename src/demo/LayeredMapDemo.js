import React, { Component } from "react";
import LayeredMap from "../lib/components/LayeredMap";

const data = require("./example-data/layered-map.json");

class LayeredMapDemo extends Component {
    render() {
        return (
            <div
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}
            >
                <div>
                    <LayeredMap
                        id={"layered-map-demo1"}
                        sync_ids={["layered-map-demo2"]}
                        layers={data.layers}
                        overlay_layers={data.overlay_layers}
                        setProps={e => console.log(e)}
                        draw_toolbar_marker={true}
                        draw_toolbar_polygon={true}
                        draw_toolbar_polyline={true}
                        showScaleY={true}
                        uirevision="someinitialstring"
                    />
                </div>
                <div>
                    <LayeredMap
                        id={"layered-map-demo2"}
                        sync_ids={["layered-map-demo1"]}
                        layers={data.layers}
                        overlay_layers={data.overlay_layers}
                        setProps={e => console.log(e)}
                        draw_toolbar_marker={true}
                        draw_toolbar_polygon={true}
                        draw_toolbar_polyline={true}
                        showScaleY={true}
                        uirevision="someinitialstring"
                    />
                </div>
            </div>
        );
    }
}

export default LayeredMapDemo;
