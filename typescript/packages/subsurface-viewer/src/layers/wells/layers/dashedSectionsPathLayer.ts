import type {
    Accessor,
    GetPickingInfoParams,
    Layer,
    LayerData,
    LayersList,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import { PathStyleExtension } from "@deck.gl/extensions";
import type { PathLayerProps } from "@deck.gl/layers";
import { PathLayer } from "@deck.gl/layers";
import type { PathGeometry } from "@deck.gl/layers/dist/path-layer/path";
import type { Position } from "geojson";
import _ from "lodash";
import type { LayerPickInfo } from "../../utils/layerTools";
import {
    getFromAccessor,
    hasUpdateTriggerChanged,
} from "../../utils/layerTools";
import { interpolateDataOnTrajectory } from "../utils/trajectory";

export enum SubLayerId {
    DASHED_PATH = "dashed-paths",
    SOLID_PATH = "solid-paths",
}

type ComputedPathSection = {
    id: string;
    pathType: "dashed" | "normal";
    path: PathGeometry[];
    properties: Record<string, unknown>;
};

type _DashedSectionsPathLayerProps<TData = unknown> = {
    getDashArray: Accessor<TData, [number, number]>;
    getPath: Accessor<TData, Position[]>;
    getDashedSectionsAlongPath: Accessor<TData, number[] | number[][]>;
    getPathFractions: Accessor<TData, number[]>;
};

export type DashedSectionsPathLayerProps<TData = unknown> = Omit<
    PathLayerProps<TData>,
    "getPath"
> &
    _DashedSectionsPathLayerProps<TData>;

export class DashedSectionsPathLayer<TData = unknown> extends CompositeLayer<
    DashedSectionsPathLayerProps<TData>
> {
    static layerName = "DashedSectionsPathLayer";
    static defaultProps = {
        ...PathLayer.defaultProps,
        getDashArray: PathStyleExtension.defaultProps.getDashArray,
        getDashedSectionsAlongPath: {
            type: "accessor",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value: (object: any) => object.dashSectionsAlongPath,
        },

        getPathFractions: {
            type: "accessor",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value: (object: any) => object.md,
        },
    };

    state!: {
        dashedPathSubLayerData: ComputedPathSection[];
        normalPathSubLayerData: ComputedPathSection[];

        // Caches for computed values, mapped by source data row index
        sectionsCache: Map<number, number[][]>;
        pathCache: Map<number, Position[]>;
        pathFractionsCache: Map<number, number[]>;
    };

    updateState({ changeFlags }: UpdateParameters<this>): void {
        if (!this.isLoaded) return;

        const data = this.props.data as LayerData<TData>;
        const {
            getDashedSectionsAlongPath: getSectionsAlongPath,
            getPathFractions,
            getPath,
        } = this.props;

        if (!Array.isArray(data))
            throw Error(
                `Expected loaded data to be a list, instead got ${typeof data}`
            );

        const dataChanged = changeFlags.dataChanged;
        const pathChanged = hasUpdateTriggerChanged(changeFlags, "getPath");
        const pathFractionsChanged = hasUpdateTriggerChanged(
            changeFlags,
            "getPathFractions"
        );
        const sectionsChanged = hasUpdateTriggerChanged(
            changeFlags,
            "getDashedSectionsAlongPath"
        );

        if (
            dataChanged ||
            pathChanged ||
            pathFractionsChanged ||
            sectionsChanged
        ) {
            // Each path will need to be split into two data sets based on whether the section is dashed or not.
            const dashedPathSubLayerData: ComputedPathSection[] = [];
            const normalPathSubLayerData: ComputedPathSection[] = [];

            const pathCache = this.state.pathCache ?? new Map();
            const pathFractionsCache =
                this.state.pathFractionsCache ?? new Map();
            const sectionsCache = this.state.sectionsCache ?? new Map();

            for (let index = 0; index < data.length; index++) {
                const datum = data[index];
                const itemContext = { data, index, target: [] };

                // Only recompute from accessors if relevant changeflags (or data) has changed since last time
                if (pathChanged || dataChanged) {
                    pathCache.set(
                        index,
                        getFromAccessor(getPath, datum, itemContext)
                    );
                }

                if (pathFractionsChanged || dataChanged) {
                    pathFractionsCache.set(
                        index,
                        getFromAccessor(getPathFractions, datum, itemContext)
                    );
                }

                if (sectionsChanged || dataChanged) {
                    const sections = getFromAccessor(
                        getSectionsAlongPath,
                        datum,
                        itemContext
                    );

                    const chunkedSections: number[][] =
                        typeof sections[0] === "number"
                            ? _.chunk(sections as number[], 2)
                            : (sections as number[][]);

                    sectionsCache.set(index, chunkedSections);
                }

                const path = pathCache.get(index)!;
                const pathFractions = pathFractionsCache.get(index)!;
                const sections = sectionsCache.get(index)!;

                let prevSectionEnd = 0;

                // ! We assume sections are sorted
                for (const section of sections) {
                    const dashedSectionStart = section[0];
                    const dashedSectionEnd = section[1] ?? 1;

                    // There's a gap between these dashed segments, so we add a normal path
                    if (dashedSectionStart > prevSectionEnd) {
                        const normalSection: ComputedPathSection = {
                            id: `path-${index}-normal-section-${normalPathSubLayerData.length}`,
                            pathType: "normal",
                            properties: {},
                            path: getSectionPathPositions(
                                path,
                                pathFractions,
                                prevSectionEnd,
                                dashedSectionStart
                            ),
                        };

                        normalPathSubLayerData.push(
                            this.getSubLayerRow(normalSection, datum, index)
                        );
                    }

                    const dashedSection: ComputedPathSection = {
                        id: `path-${index}-dashed-section-${normalPathSubLayerData.length}`,
                        pathType: "dashed",
                        properties: {},
                        path: getSectionPathPositions(
                            path,
                            pathFractions,
                            dashedSectionStart,
                            dashedSectionEnd
                        ),
                    };

                    dashedPathSubLayerData.push(
                        this.getSubLayerRow(dashedSection, datum, index)
                    );

                    prevSectionEnd = dashedSectionEnd;
                }

                if (prevSectionEnd < 1) {
                    const normalSection: ComputedPathSection = {
                        id: `path-${index}-normal-section-${normalPathSubLayerData.length}`,
                        pathType: "normal",
                        properties: {},
                        path: getSectionPathPositions(
                            path,
                            pathFractions,
                            prevSectionEnd,
                            1
                        ),
                    };

                    normalPathSubLayerData.push(
                        this.getSubLayerRow(normalSection, datum, index)
                    );
                }
            }

            this.setState({
                dashedPathSubLayerData,
                normalPathSubLayerData,
                pathCache,
                pathFractionsCache,
                sectionsCache,
            });
        }
    }

    getSubLayerId(sublayerId: SubLayerId): string {
        return this.getSubLayerProps({ id: sublayerId }).id;
    }

    getPickingInfo(params: GetPickingInfoParams): LayerPickInfo {
        const sourceInfo = super.getPickingInfo(params);

        if (!sourceInfo.coordinate || !sourceInfo.object) return sourceInfo;

        if (
            sourceInfo.coordinate.length === 3 &&
            this.props.positionFormat === "XY"
        ) {
            // Occasionally some other picking logic (f.ex. the re-triggered picking from the Map wrapper) will fire this with a 3D coordinate, regardless of position-format. To avoid picking the wrong segment, we discard the z-coord
            sourceInfo.coordinate = sourceInfo.coordinate.slice(0, 2);
        }

        let path = this.state.pathCache.get(sourceInfo.index);
        const sections = this.state.sectionsCache.get(sourceInfo.index);
        const pathFractions = this.state.pathFractionsCache.get(
            sourceInfo.index
        );

        if (!path || !pathFractions || !sections) {
            throw Error("Expected cached accessor values for hovered object");
        }

        if (sourceInfo.coordinate.length === 2) {
            path = path.map((v) => v.slice(0, 2));
        }

        const hoveredFraction = interpolateDataOnTrajectory(
            sourceInfo.coordinate,
            pathFractions,
            path
        );

        // ? Possibly allow more nuanced info here?

        if (hoveredFraction == null) return sourceInfo;

        const hoveredSectionIndex = sections.findIndex(
            ([from, to]) => from <= hoveredFraction && to >= hoveredFraction
        );

        return {
            ...sourceInfo,
            properties: [
                { name: "posAlong", value: hoveredFraction ?? "?" },
                {
                    name: "isInDashSection",
                    value: String(hoveredSectionIndex !== -1),
                },
                { name: "segmentIndex", value: hoveredSectionIndex },
            ],
        };
    }

    renderLayers(): Layer | null | LayersList {
        const otherProps = _.omit(this.props, "getPath");

        return [
            new PathLayer({
                ...this.getSubLayerProps({
                    ...otherProps,
                    id: SubLayerId.DASHED_PATH,
                }),
                data: this.state.dashedPathSubLayerData,

                extensions: [
                    new PathStyleExtension({
                        dash: true,
                        highPrecisionDash: true,
                    }),
                ],
                getDashArray: this.props.getDashArray,
                dashGapPickable: true,
            }),

            new PathLayer({
                ...this.getSubLayerProps({
                    ...otherProps,
                    id: SubLayerId.SOLID_PATH,
                }),
                data: this.state.normalPathSubLayerData,
            }),
        ];
    }
}

function getSectionPathPositions(
    path: Position[],
    pathFractions: number[],
    startFraction: number,
    endFraction: number
): Position[] {
    if (path.length === 0) return [];
    if (pathFractions.length !== path.length)
        throw Error(
            "Expected path measurements array to be same length as path array"
        );

    startFraction = _.clamp(startFraction, 0, 1);
    endFraction = _.clamp(endFraction, 0, 1);

    let startIndex = _.sortedIndex(pathFractions, startFraction);
    const endIndex = _.sortedIndex(pathFractions, endFraction);

    // Build a segment of positions
    const segment: Position[] = [];

    if (isClose(pathFractions[startIndex], startFraction)) {
        segment.push(path[startIndex]);
        startIndex++;
    } else {
        // Interpolate the starting position
        const prevIdx = startIndex - 1;
        const prevFraction = pathFractions[prevIdx];
        const nextFraction = pathFractions[startIndex];
        const t =
            (startFraction - prevFraction) / (nextFraction - prevFraction);

        const prevPos = path[prevIdx];
        const nextPos = path[startIndex];
        const interpolated = prevPos.map(
            (coord, i) => coord + (nextPos[i] - coord) * t
        ) as Position;
        segment.push(interpolated);
    }

    segment.push(...path.slice(startIndex, endIndex));

    if (isClose(pathFractions[endIndex], endFraction)) {
        segment.push(path[endIndex]);
    } else {
        // Interpolate the end position of the segment
        const prevIdx = endIndex - 1;
        const prevFraction = pathFractions[prevIdx];
        const nextFraction = pathFractions[endIndex];
        const t = (endFraction - prevFraction) / (nextFraction - prevFraction);

        const prevPos = path[prevIdx];
        const nextPos = path[endIndex];
        const interpolated = prevPos.map(
            (coord, i) => coord + (nextPos[i] - coord) * t
        ) as Position;
        segment.push(interpolated);
    }

    return segment;
}

function isClose(
    number: number,
    otherNumber: number,
    threshold: number = 0.001
) {
    return Math.abs(number - otherNumber) < threshold;
}
