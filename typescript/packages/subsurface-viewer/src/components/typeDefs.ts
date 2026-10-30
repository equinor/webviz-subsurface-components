import type { Color, Layer } from "@deck.gl/core";

import type { ColormapFunctionType } from "../layers/utils/colormapTools";

interface LegendBaseData {
    title: string;
    colorName: string;
    discrete: boolean;
    colorMapFunction?: ColormapFunctionType;
}
export interface DiscreteLegendDataType extends LegendBaseData {
    metadata: Record<string, [Color, number]>;
}

export interface ContinuousLegendDataType extends LegendBaseData {
    valueRange: [number, number];
}

export interface ExtendedLegendLayer extends Layer {
    getLegendData?: () => DiscreteLegendDataType | ContinuousLegendDataType;
}
