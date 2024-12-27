import { CompositeLayer } from "@deck.gl/core";
import { IconLayer } from "@deck.gl/layers";

import type { DefaultProps } from "@deck.gl/core";

function makeCrossHairSvg(color: [number, number, number, number]): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="150px" height="150px"
	 viewBox="0 0 150 150" xml:space="preserve">
<rect x="72" y="72" width="9" height="9" fill="rgb(${color.join(", ")})" />
<rect x="9" y="72" width="54" height="9" fill="rgb(${color.join(", ")})" />
<rect x="72" y="9" width="9" height="54" fill="rgb(${color.join(", ")})" />
<rect x="90" y="72" width="54" height="9" fill="rgb(${color.join(", ")})" />
<rect x="72" y="90" width="9" height="54" fill="rgb(${color.join(", ")})" />
</svg>`;
}

export type CrosshairLayerProps = {
    id: string;
    worldCoordinates: [number, number, number] | null;
    color?: [number, number, number, number];
    sizePx?: number;
    visible?: boolean;
};

const defaultProps: DefaultProps<CrosshairLayerProps> = {
    color: [0, 0, 0, 0.5],
    sizePx: 24,
    visible: true,
};

class CrosshairLayer extends CompositeLayer<CrosshairLayerProps> {
    static layerName: string = "CrosshairLayer";
    static defaultProps = defaultProps;

    renderLayers() {
        if (!this.props.worldCoordinates || !this.props.visible) {
            return [];
        }

        return [
            new IconLayer(
                this.getSubLayerProps({
                    id: "crosshair-icon-layer",
                    getIcon: () => ({
                        width: 150,
                        height: 150,
                        url: svgToDataURL(
                            makeCrossHairSvg(this.props.color || [0, 0, 0, 255])
                        ),
                    }),
                    data: this.props.worldCoordinates
                        ? [this.props.worldCoordinates]
                        : [],
                    getPosition: (d: [number, number, number]) => d,
                    getSize: this.props.sizePx,
                    sizeUnits: "pixels",
                    getColor: () => this.props.color || [0, 0, 0, 255],
                    pickable: false,
                })
            ),
        ];
    }
}

function svgToDataURL(svg: string): string {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default CrosshairLayer;
