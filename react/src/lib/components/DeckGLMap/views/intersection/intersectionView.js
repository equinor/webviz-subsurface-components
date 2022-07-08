import { OrthographicController, View, Viewport } from "@deck.gl/core";

import { Matrix4 } from "@math.gl/core";

// Displaying in 2d view XZ plane by configuring the view matrix
const viewMatrix = new Matrix4().lookAt({
    eye: [0, -1, 0],
    up: [0, 0, 1],
    center: [0, 0, 0],
});

function getProjectionMatrix({ width, height, near, far }) {
    // Make sure Matrix4.ortho doesn't crash on 0 width/height
    width = width || 1;
    height = height || 1;

    return new Matrix4().ortho({
        left: -width / 2,
        right: width / 2,
        bottom: -height / 2,
        top: height / 2,
        near,
        far,
    });
}

class IntersectionViewport extends Viewport {
    constructor(props) {
        const {
            width,
            height,
            near = 0.1,
            far = 1000,
            zoom = 0,
            target = [0, 0, 0],
            flipY = true,
        } = props;
        const zoomX = Array.isArray(zoom) ? zoom[0] : zoom;
        const zoomY = Array.isArray(zoom) ? zoom[1] : zoom;
        const zoomZ = Array.isArray(zoom) ? zoom[2] : zoom;
        const zoom_ = Math.min(zoomX, zoomY, zoomZ);
        const scale = Math.pow(2, zoom_);

        let distanceScales;
        if (zoomX !== zoomY) {
            const scaleX = Math.pow(2, zoomX);
            const scaleY = Math.pow(2, zoomY);
            const scaleZ = Math.pow(2, zoomZ);

            distanceScales = {
                unitsPerMeter: [scaleX / scale, scaleY / scale, scaleZ / scale],
                metersPerUnit: [scale / scaleX, scale / scaleY, scale / scaleZ],
            };
        }

        super({
            ...props,
            // in case viewState contains longitude/latitude values,
            // make sure that the base Viewport class does not treat this as a geospatial viewport
            longitude: null,
            position: target,
            viewMatrix: viewMatrix
                .clone()
                .scale([scale, scale * (flipY ? -1 : 1), scale]),
            projectionMatrix: getProjectionMatrix({ width, height, near, far }),
            zoom: zoom_,
            distanceScales,
        });
    }
}

export default class IntersectionView extends View {
    constructor(props) {
        super({
            ...props,
            type: IntersectionViewport,
        });
    }

    get controller() {
        return this._getControllerProps({
            type: OrthographicController,
        });
    }
}

IntersectionView.displayName = "IntersectionView";
