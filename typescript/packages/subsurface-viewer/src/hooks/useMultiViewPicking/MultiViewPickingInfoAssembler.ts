import type { PickingInfo, Viewport } from "@deck.gl/core";
import { DeckGLRef } from "@deck.gl/react";
import { ExtendedLayerProps, MapMouseEvent, PropertyDataType } from "../../";

export type LayerPickingInfo = {
    layerId: string;
    layerName: string;
    properties: PropertyDataType[];
};

export type PickingInfoPerView = Record<
    string,
    {
        coordinates: number[] | null;
        layerPickingInfo: LayerPickingInfo[];
    }
>;

function hasPropertiesArray(obj: any): obj is { properties: PropertyDataType[] } {
    return obj && Array.isArray(obj.properties);
}

function hasSingleProperty(obj: any): obj is { propertyValue: number } {
    return obj && "propertyValue" in obj && typeof obj.propertyValue === "number";
}

export type MultiViewPickingInfoAssemblerOptions = {
    multiPicking: boolean;
    pickDepth: number;
};

export interface MultiViewPickingInfoAssemblerSubscriberCallback {
    (info: PickingInfoPerView, activeViewportId: string): void;
}

export class MultiViewPickingInfoAssembler {
    private _deckGl: DeckGLRef | null = null;
    private _options: MultiViewPickingInfoAssemblerOptions;
    private _subscribers: Set<MultiViewPickingInfoAssemblerSubscriberCallback> = new Set();

    constructor(
        deckGL: DeckGLRef | null,
        options: MultiViewPickingInfoAssemblerOptions = { multiPicking: false, pickDepth: 1 }
    ) {
        this._deckGl = deckGL;
        this._options = options;
    }

    setDeckGL(deckGL: DeckGLRef) {
        this._deckGl = deckGL;
    }

    subscribe(callback: MultiViewPickingInfoAssemblerSubscriberCallback): () => void {
        this._subscribers.add(callback);

        return () => {
            this._subscribers.delete(callback);
        };
    }

    private publish(info: PickingInfoPerView, activeViewportId: string) {
        for (const subscriber of this._subscribers) {
            subscriber(info, activeViewportId);
        }
    }

    getMultiViewPickingInfo(hoverEvent: MapMouseEvent) {
        if (!this._deckGl?.deck) {
            return;
        }

        const viewports = this._deckGl.deck?.getViewports();
        if (!viewports) {
            return;
        }

        if (hoverEvent.infos.length === 0) {
            return;
        }

        const activeViewportId = hoverEvent.infos[0].viewport?.id;

        if (!activeViewportId) {
            return;
        }

        const eventScreenCoordinate: [number, number] = [hoverEvent.infos[0].x, hoverEvent.infos[0].y];

        this.assembleMultiViewPickingInfo(eventScreenCoordinate, activeViewportId, viewports).then((info) => {
            this.publish(info, activeViewportId);
        });
    }

    private async assembleMultiViewPickingInfo(
        eventScreenCoordinate: [number, number],
        activeViewportId: string,
        viewports: Viewport[]
    ): Promise<PickingInfoPerView> {
        return new Promise((resolve, reject) => {
            const deck = this._deckGl?.deck;
            if (!deck) {
                reject("DeckGL not initialized");
                return;
            }
            const activeViewport = viewports.find((el) => el.id === activeViewportId);
            if (!activeViewport) {
                reject("Active viewport not found");
                return;
            }

            const activeViewportRelativeScreenCoordinates: [number, number] = [
                eventScreenCoordinate[0] - activeViewport.x,
                eventScreenCoordinate[1] - activeViewport.y,
            ];

            const worldCoordinate = activeViewport.unproject(activeViewportRelativeScreenCoordinates);

            const collectedPickingInfo: PickingInfoPerView = {};
            for (const viewport of viewports) {
                const [relativeScreenX, relativeScreenY] = viewport.project(worldCoordinate);

                let pickingInfo: PickingInfo[] = [];
                if (this._options.multiPicking) {
                    pickingInfo = deck.pickMultipleObjects({
                        x: relativeScreenX + viewport.x,
                        y: relativeScreenY + viewport.y,
                        depth: this._options.pickDepth,
                        unproject3D: true,
                    });
                } else {
                    const obj = deck.pickObject({
                        x: relativeScreenX + viewport.x,
                        y: relativeScreenY + viewport.y,
                        unproject3D: true,
                    });
                    pickingInfo = obj ? [obj] : [];
                }

                if (pickingInfo) {
                    const collectedLayerPickingInfo: LayerPickingInfo[] = [];
                    for (const info of pickingInfo) {
                        const hasMultipleProperties = hasPropertiesArray(info);
                        const hasOneProperty = hasSingleProperty(info);

                        if (!hasMultipleProperties && !hasOneProperty) {
                            continue;
                        }

                        if (!info.layer) {
                            continue;
                        }

                        if (collectedLayerPickingInfo.find((el) => el.layerId === info.layer?.id)) {
                            continue;
                        }

                        const layerId = info.layer.id;
                        const layerName = (info.layer.props as unknown as ExtendedLayerProps).name;

                        let layerPickingInfo = collectedLayerPickingInfo.find((el) => el.layerId === layerId);

                        if (!layerPickingInfo) {
                            collectedLayerPickingInfo.push({
                                layerId,
                                layerName,
                                properties: [],
                            });
                            layerPickingInfo = collectedLayerPickingInfo[collectedLayerPickingInfo.length - 1];
                        }

                        if (hasOneProperty) {
                            layerPickingInfo.properties.push({
                                name: "Value",
                                value: info.propertyValue,
                                color: undefined,
                            });
                            continue;
                        }

                        if (hasMultipleProperties) {
                            const properties = info.properties;

                            for (const property of properties) {
                                layerPickingInfo.properties.push({
                                    name: property.name,
                                    value: property.value,
                                    color: property.color,
                                });
                            }
                        }
                    }

                    collectedPickingInfo[viewport.id] = {
                        coordinates: worldCoordinate,
                        layerPickingInfo: collectedLayerPickingInfo,
                    };
                } else {
                    collectedPickingInfo[viewport.id] = {
                        coordinates: null,
                        layerPickingInfo: [],
                    };
                }
            }

            resolve(collectedPickingInfo);
        });
    }
}