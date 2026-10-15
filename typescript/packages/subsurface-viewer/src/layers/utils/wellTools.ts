import type { LayersList } from "@deck.gl/core";

export type NewLayersList = LayersList & {
    id: string;
    props: Prop;
};

type Prop = {
    data: WellData;
    visible: boolean;
};

type WellData = {
    features: Feature[];
    type: string;
    unit?: string;
};

type Feature = {
    properties: {
        name: string;
    };
};

export function getWellLayerByTypeAndSelectedWells(
    layers: LayersList,
    type: string,
    selectedWell: string
): LayersList {
    if (!layers || !selectedWell) {
        return [];
    }
    return layers.filter((l) => {
        return (
            l?.constructor.name === type &&
            (l as NewLayersList).props.data?.features?.find(
                (item) => item.properties.name === selectedWell
            )
        );
    });
}
