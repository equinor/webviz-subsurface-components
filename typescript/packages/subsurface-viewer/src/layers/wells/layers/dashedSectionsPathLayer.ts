import type {
    Accessor,
    GetPickingInfoParams,
    Layer,
    LayerData,
    LayersList,
    UpdateParameters,
} from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";
import type { DataFilterExtensionProps } from "@deck.gl/extensions";
import { DataFilterExtension, PathStyleExtension } from "@deck.gl/extensions";
import type { PathLayerProps } from "@deck.gl/layers";
import { PathLayer } from "@deck.gl/layers";
import type { PathGeometry } from "@deck.gl/layers/dist/path-layer/path";
import type { Position } from "geojson";
import _ from "lodash";

import { isClose } from "../../../utils/measurement";
import {
    getFromAccessor,
    hasUpdateTriggerChanged,
} from "../../utils/layerTools";
import type { DashedSectionsLayerPickInfo } from "../types";
import {
    getCumulativeDistance,
    getFractionPositionSegmentIndices,
    interpolateDataOnTrajectory,
} from "../utils/trajectory";
import type { MarkerData } from "./trajectoryMarkerLayer";

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
    getScreenDashArray: Accessor<TData, [number, number]>;
    getPath: Accessor<TData, Position[]>;
    getDashedSectionsAlongPath: Accessor<TData, number[] | number[][]>;
    getCumulativePathDistance: Accessor<TData, number[]>;
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
        getScreenDashArray: PathStyleExtension.defaultProps.getDashArray,
        getDashedSectionsAlongPath: {
            type: "accessor",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value: (object: any) => object.dashSectionsAlongPath,
        },

        getCumulativePathDistance: {
            type: "accessor",
            // If not provided, we manually compute it from the path
            value: undefined,
        },
    };

    state!: {
        dashedPathSubLayerData: ComputedPathSection[];
        normalPathSubLayerData: ComputedPathSection[];

        // Caches for computed values, mapped by source data row index
        sectionsCache: Map<number, number[][]>;
        pathCache: Map<number, Position[]>;
        cumulativePathDistanceCache: Map<number, number[]>;
    };

    updateState({ changeFlags }: UpdateParameters<this>): void {
        if (!this.isLoaded) return;

        const data = this.props.data as LayerData<TData>;
        const {
            getDashedSectionsAlongPath,
            getCumulativePathDistance,
            getPath,
        } = this.props;

        if (!Array.isArray(data))
            throw Error(
                `Expected loaded data to be a list, instead got ${typeof data}`
            );

        const dataChanged = changeFlags.dataChanged;
        const pathChanged = hasUpdateTriggerChanged(changeFlags, "getPath");
        const cumulativePathDistanceChanged = hasUpdateTriggerChanged(
            changeFlags,
            "getCumulativePathDistance"
        );
        const sectionsChanged = hasUpdateTriggerChanged(
            changeFlags,
            "getDashedSectionsAlongPath"
        );

        if (
            dataChanged ||
            pathChanged ||
            cumulativePathDistanceChanged ||
            sectionsChanged
        ) {
            // Each path will need to be split into two data sets based on whether the section is dashed or not.
            const dashedPathSubLayerData: ComputedPathSection[] = [];
            const normalPathSubLayerData: ComputedPathSection[] = [];

            const pathCache = this.state.pathCache ?? new Map();
            const cumulativePathDistanceCache =
                this.state.cumulativePathDistanceCache ?? new Map();
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

                if (cumulativePathDistanceChanged || dataChanged) {
                    let cumulativeDistance = getFromAccessor(
                        getCumulativePathDistance,
                        datum,
                        itemContext
                    );

                    if (!cumulativeDistance) {
                        cumulativeDistance = getCumulativeDistance(
                            pathCache.get(index)!
                        );
                    }

                    cumulativePathDistanceCache.set(index, cumulativeDistance);
                }

                if (sectionsChanged || dataChanged) {
                    const sections =
                        getFromAccessor(
                            getDashedSectionsAlongPath,
                            datum,
                            itemContext
                        ) ?? [];

                    const chunkedSections: number[][] =
                        typeof sections[0] === "number"
                            ? _.chunk(sections as number[], 2)
                            : (sections as number[][]);

                    sectionsCache.set(index, chunkedSections);
                }

                const path = pathCache.get(index)!;
                const sections = sectionsCache.get(index)!;
                const cumulativePathDistance =
                    cumulativePathDistanceCache.get(index)!;

                let prevSectionEnd = 0;

                // If a data-filter extension is present, we might need to split the filter value array along the path.
                let filterValue: undefined | number | number[];
                const { filterEnabled, getFilterValue } = this
                    .props as DataFilterExtensionProps;
                const hasFilterExtension = this.props.extensions?.some(
                    (e) => e instanceof DataFilterExtension
                );

                if (hasFilterExtension && filterEnabled && getFilterValue) {
                    filterValue = getFromAccessor(
                        getFilterValue,
                        datum,
                        itemContext
                    );
                }

                // ! We assume sections are sorted
                for (const section of sections) {
                    const dashedSectionStart = section[0];
                    const dashedSectionEnd = section[1] ?? 1;

                    // There's a gap between these dashed segments, so we add a normal path
                    if (dashedSectionStart > prevSectionEnd) {
                        const normalSection: ComputedPathSection = {
                            id: `path-${index}-normal-section-${normalPathSubLayerData.length}`,
                            pathType: "normal",
                            properties: {
                                filterValue: getSectionFilterValue(
                                    filterValue,
                                    cumulativePathDistance,
                                    prevSectionEnd,
                                    dashedSectionStart
                                ),
                            },
                            path: getSectionPathPositions(
                                path,
                                cumulativePathDistance,
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
                        properties: {
                            filterValue: getSectionFilterValue(
                                filterValue,
                                cumulativePathDistance,
                                dashedSectionStart,
                                dashedSectionEnd
                            ),
                        },
                        path: getSectionPathPositions(
                            path,
                            cumulativePathDistance,
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
                        properties: {
                            filterValue: getSectionFilterValue(
                                filterValue,
                                cumulativePathDistance,
                                prevSectionEnd,
                                1
                            ),
                        },
                        path: getSectionPathPositions(
                            path,
                            cumulativePathDistance,
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
                sectionsCache,
                cumulativePathDistanceCache,
            });
        }
    }

    getSubLayerId(sublayerId: SubLayerId): string {
        return this.getSubLayerProps({ id: sublayerId }).id;
    }

    getPickingInfo(params: GetPickingInfoParams): DashedSectionsLayerPickInfo {
        const sourceInfo = super.getPickingInfo(params);

        if (!sourceInfo.coordinate || !sourceInfo.object) return sourceInfo;

        if (
            sourceInfo.coordinate.length === 3 &&
            this.props.positionFormat === "XY"
        ) {
            // Occasionally some other picking logic (f.ex. the re-triggered picking from the Map wrapper) will fire this with a 3D coordinate, regardless of position-format. To avoid picking the wrong segment, we discard the z-coord
            sourceInfo.coordinate = sourceInfo.coordinate.slice(0, 2);
        }

        const coordinate = sourceInfo.coordinate;

        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;
        if (typeof coordinate[2] !== "undefined") {
            coordinate[2] /= Math.max(0.001, zScale);
        }

        let path = this.state.pathCache.get(sourceInfo.index);
        const sections = this.state.sectionsCache.get(sourceInfo.index);
        const cumulativePathDistance =
            this.state.cumulativePathDistanceCache.get(sourceInfo.index);

        if (!path || !cumulativePathDistance || !sections) {
            throw Error("Expected cached accessor values for hovered object");
        }

        if (sourceInfo.coordinate.length === 2) {
            path = path.map((v) => v.slice(0, 2));
        }

        const hoveredDistance = interpolateDataOnTrajectory(
            sourceInfo.coordinate,
            cumulativePathDistance,
            path
        );

        if (hoveredDistance == null) return sourceInfo;

        const hoveredPositionAlong =
            hoveredDistance / cumulativePathDistance.at(-1)!;

        // ? Possibly allow more nuanced info here?

        const hoveredSectionIndex = sections.findIndex(
            ([from, to]) =>
                from <= hoveredPositionAlong && to >= hoveredPositionAlong
        );

        return {
            ...sourceInfo,
            dashedSectionIndex: hoveredSectionIndex,
            positionAlong: hoveredDistance,
        };
    }

    renderLayers(): Layer | null | LayersList {
        const otherProps = _.omit(this.props, "getPath");

        return [
            new PathLayer({
                ...this.getSubLayerProps({
                    ...otherProps,
                    id: SubLayerId.DASHED_PATH,
                    data: this.state.dashedPathSubLayerData,
                    getColor: this.getSubLayerAccessor(this.props.getColor),
                    extensions: [
                        ...this.props.extensions.filter(
                            (f) => !(f instanceof PathStyleExtension)
                        ),
                        new PathStyleExtension({
                            dash: true,
                            highPrecisionDash: true,
                        }),
                    ],
                } as Partial<PathLayerProps>),
                // ! These props gets overriden if included inside getSubLayerProps
                getDashArray: this.props.getScreenDashArray,
                dashGapPickable: true,
                getFilterValue: (d: MarkerData) =>
                    d.properties?.["filterValue"],
            }),

            new PathLayer({
                ...this.getSubLayerProps({
                    ...otherProps,
                    id: SubLayerId.SOLID_PATH,
                    data: this.state.normalPathSubLayerData,
                    getColor: this.getSubLayerAccessor(this.props.getColor),
                    parameters: this.props.parameters,
                } as Partial<PathLayerProps>),
                getFilterValue: (d: MarkerData) =>
                    d.properties?.["filterValue"],
            }),
        ];
    }
}

function getSectionFilterValue(
    filterValue: undefined | number | number[],
    cumulativePathDistance: number[],
    startFraction: number,
    endFraction: number
): undefined | number | number[] {
    if (!Array.isArray(filterValue)) return filterValue;
    if (startFraction === 0 && endFraction === 1) return [...filterValue];
    if (filterValue.length !== cumulativePathDistance.length) {
        throw Error(
            "Expected filter value array to be same length as path computation array"
        );
    }

    const { sliceStart, sliceEnd, startSegment, endSegment } =
        computeSliceIndices(
            filterValue,
            cumulativePathDistance,
            startFraction,
            endFraction
        );

    const startFilterValue = startSegment[0];
    const endFilterValue = endSegment[1];

    // Build a segment of positions
    const segment = [
        startFilterValue,
        ...filterValue.slice(sliceStart, sliceEnd),
        endFilterValue,
    ];

    return segment;
}

function getSectionPathPositions(
    path: Position[],
    cumulativePathDistance: number[],
    startFraction: number,
    endFraction: number
): Position[] {
    if (startFraction === 0 && endFraction === 1) return [...path];
    if (path.length === 0) return [];
    if (cumulativePathDistance.length !== path.length) {
        throw Error(
            "Expected path measurements array to be same length as path array"
        );
    }

    const { sliceStart, sliceEnd, startSegment, endSegment } =
        computeSliceIndices(
            path,
            cumulativePathDistance,
            startFraction,
            endFraction
        );

    const startPosition = _.zipWith(
        startSegment[0],
        startSegment[1],
        (pl, pu) => {
            return pl + startSegment[2] * (pu - pl);
        }
    );

    const endPosition = _.zipWith(endSegment[0], endSegment[1], (pl, pu) => {
        return pl + endSegment[2] * (pu - pl);
    });

    // Build a segment of positions
    const segment: Position[] = [
        startPosition,
        ...path.slice(sliceStart, sliceEnd),
        endPosition,
    ];

    return segment;
}

function computeSliceIndices<T>(
    dataArr: T[],
    cumulativePathDistance: number[],
    startFraction: number,
    endFraction: number
): {
    startSegment: [T, T, number];
    endSegment: [T, T, number];
    sliceStart: number;
    sliceEnd: number;
} {
    if (cumulativePathDistance.length !== dataArr.length) {
        throw Error(
            "Expected distance and data array to be same length as path array"
        );
    }

    const [lowerIndexStart, upperIndexStart, sectionFractionStart] =
        getFractionPositionSegmentIndices(
            startFraction,
            dataArr,
            cumulativePathDistance
        );

    const [lowerIndexEnd, upperIndexEnd, sectionFractionEnd] =
        getFractionPositionSegmentIndices(
            endFraction,
            dataArr,
            cumulativePathDistance
        );

    const sliceStartOffset = isClose(sectionFractionStart, 1) ? 1 : 0;
    const sliceEndOffset = isClose(sectionFractionEnd, 0) ? 2 : 1;

    return {
        startSegment: [
            dataArr[lowerIndexStart],
            dataArr[upperIndexStart],
            sectionFractionStart,
        ],
        endSegment: [
            dataArr[lowerIndexEnd],
            dataArr[upperIndexEnd],
            sectionFractionEnd,
        ],

        sliceStart: upperIndexStart + sliceStartOffset,
        sliceEnd: lowerIndexEnd + sliceEndOffset,
    };
}
