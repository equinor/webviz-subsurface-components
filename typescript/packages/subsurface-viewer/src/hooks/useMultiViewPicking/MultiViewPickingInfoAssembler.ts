import type { PickingInfo, Viewport } from "@deck.gl/core";
import type { DeckGLRef } from "@deck.gl/react";

import _ from "lodash";

import type {
    ExtendedLayerProps,
    MapMouseEvent,
    PropertyDataType,
} from "../../";
import { distance } from "mathjs";

export type LayerPickingInfo = {
    layerId: string;
    layerName: string;
    properties: PropertyDataType[];
};

export type ViewportPickInfo = {
    coordinates: number[] | null;
    layerPickingInfo: LayerPickingInfo[];
};
export type PickingInfoPerView = Record<string, ViewportPickInfo>;

function hasPropertiesArray(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any
): obj is { properties: PropertyDataType[] } {
    return obj && Array.isArray(obj.properties);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hasSingleProperty(obj: any): obj is { propertyValue: number } {
    return (
        obj && "propertyValue" in obj && typeof obj.propertyValue === "number"
    );
}

function getUniqueInfoPickId(pick: PickingInfo): string {
    return `${pick.index}::${pick.layer?.id}`;
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
    private _subscribers: Set<MultiViewPickingInfoAssemblerSubscriberCallback> =
        new Set();

    constructor(
        deckGL: DeckGLRef | null,
        options: MultiViewPickingInfoAssemblerOptions = {
            multiPicking: false,
            pickDepth: 1,
        }
    ) {
        this._deckGl = deckGL;
        this._options = options;
    }

    setDeckGL(deckGL: DeckGLRef) {
        this._deckGl = deckGL;
    }

    subscribe(
        callback: MultiViewPickingInfoAssemblerSubscriberCallback
    ): () => void {
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

        const eventScreenCoordinate: [number, number] = [
            hoverEvent.infos[0].x,
            hoverEvent.infos[0].y,
        ];

        this.assembleMultiViewPickingInfo(
            eventScreenCoordinate,
            activeViewportId,
            viewports
        ).then((info) => {
            this.publish(info, activeViewportId);
        });
    }

    private pickAtCoordinate(x: number, y: number): PickingInfo[] {
        const deck = this._deckGl?.deck;
        if (!deck) return [];

        if (this._options.multiPicking) {
            // ! For some reason, multi-pick pads the array up to pick-depth length, repeating the last element
            const multPickResult = deck.pickMultipleObjects({
                depth: this._options.pickDepth,
                unproject3D: true,
                x,
                y,
            });

            // Ensure the top-most element is processed first by sorting based on distance to camera
            return _.sortBy(multPickResult, (pick) => {
                if (!pick.viewport?.cameraPosition) return -1;
                if (!pick.coordinate) return -1;

                return distance(pick.coordinate, pick.viewport.cameraPosition);
            });
        } else {
            const obj = deck.pickObject({
                unproject3D: true,
                x,
                y,
            });
            return obj ? [obj] : [];
        }
    }

    private async assembleMultiViewPickingInfo(
        eventScreenCoordinate: [number, number],
        activeViewportId: string,
        viewports: Viewport[]
    ): Promise<PickingInfoPerView> {
        return new Promise((resolve, reject) => {
            if (!this._deckGl?.deck) {
                reject("DeckGL not initialized");
                return;
            }
            const activeViewport = viewports.find(
                (el) => el.id === activeViewportId
            );
            if (!activeViewport) {
                reject("Active viewport not found");
                return;
            }

            const activeViewportRelativeScreenCoordinates: [number, number] = [
                eventScreenCoordinate[0] - activeViewport.x,
                eventScreenCoordinate[1] - activeViewport.y,
            ];

            const activePickingInfo = this.pickAtCoordinate(
                eventScreenCoordinate[0],
                eventScreenCoordinate[1]
            );

            const worldCoordinate =
                activePickingInfo[0]?.coordinate ??
                activeViewport.unproject(
                    activeViewportRelativeScreenCoordinates
                );

            const collectedPickingInfo: PickingInfoPerView = {};

            for (const viewport of viewports) {
                const [screenX, screenY] = viewport.project(worldCoordinate);

                const pickingInfo = this.pickAtCoordinate(
                    screenX + viewport.x,
                    screenY + viewport.y
                );

                if (pickingInfo) {
                    const layerInfoDict: Record<string, LayerPickingInfo> = {};
                    const processedPickIds: string[] = [];
                    console.log(
                        "Picking info for viewport ",
                        viewport.id,
                        pickingInfo
                    );
                    for (const info of pickingInfo) {
                        const uniquePickId = getUniqueInfoPickId(info);
                        const hasMultipleProperties = hasPropertiesArray(info);
                        const hasOneProperty = hasSingleProperty(info);

                        // General guard clauses
                        if (!info.layer) continue;
                        if (processedPickIds.includes(uniquePickId)) continue;
                        if (!hasMultipleProperties && !hasOneProperty) continue;

                        processedPickIds.push(uniquePickId);

                        const layerId = info.layer.id;
                        const layerProps = info.layer
                            .props as unknown as ExtendedLayerProps;
                        const layerName = layerProps.name;

                        if (!layerInfoDict[layerId]) {
                            layerInfoDict[layerId] = {
                                layerId,
                                layerName,
                                properties: [],
                            };
                        }
                        const layerPickingInfo = layerInfoDict[layerId];

                        if (hasOneProperty) {
                            layerPickingInfo.properties.push({
                                name: "Value",
                                value: info.propertyValue,
                                color: undefined,
                            });
                        } else if (hasMultipleProperties) {
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
                        layerPickingInfo: Object.values(layerInfoDict),
                    };
                } else {
                    collectedPickingInfo[viewport.id] = {
                        coordinates: worldCoordinate,
                        layerPickingInfo: [],
                    };
                }
            }

            resolve(collectedPickingInfo);
        });
    }
}
