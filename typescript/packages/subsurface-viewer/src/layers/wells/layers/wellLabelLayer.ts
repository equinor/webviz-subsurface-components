import _ from "lodash";

import { Vector2, Vector3 } from "math.gl";

import type { Color, PickingInfo } from "@deck.gl/core";
import {
    OrbitViewport,
    type DefaultProps,
    type UpdateParameters,
} from "@deck.gl/core";
import type { TextLayerProps } from "@deck.gl/layers";

import type { Feature, Position } from "geojson";

import type { Point3D } from "../../../utils";
import type { WellFeature } from "../types";
import { getTrajectory } from "../utils/trajectory";
import type { MergedTextLayerProps } from "./mergedTextLayer";
import { MergedTextLayer } from "./mergedTextLayer";
import { FixedSizeExtension } from "../../../extensions/fixed-size-extension";

type WellLabelLayerData = WellFeature;

/**
 * Enum representing the orientation of well labels.
 */
export enum LabelOrientation {
    /**
     * Horizontal orientation.
     */
    HORIZONTAL = "horizontal",

    /**
     * Tangent to well trajectory orientation.
     */
    TANGENT = "tangent",
}

/**
 * Properties for the WellLabelLayer component.
 */
export type WellLabelLayerProps = MergedTextLayerProps<WellLabelLayerData> & {
    /**
     * Automatically reposition the label if it is outside the view.
     */
    autoPosition?: boolean;

    /**
     * Accessor function or value for getting the fractional position
     * along the path, [0, 1].
     */
    getPositionAlongPath?: number | ((d: Feature) => number);

    /**
     * Orientation of the label.
     */
    orientation?: LabelOrientation;

    /**
     * If true, then z values are depth. Otherwise, z values are elevation.
     */
    zIncreasingDownwards?: boolean;
};

const DEFAULT_PROPS: DefaultProps<WellLabelLayerProps> = {
    id: "well-label-layer",
    autoPosition: false,
    getPositionAlongPath: 0,
    getText: (d: WellFeature) => d.properties.name,
    getAlignmentBaseline: "bottom",
    getSize: 10,
    getColor: [0, 0, 0, 255],
    zIncreasingDownwards: true,
    orientation: LabelOrientation.HORIZONTAL,
    backgroundPadding: [3, 1, 3, 1],
    getBorderColor: [0, 0, 0, 255],
    getBorderWidth: 1,
    pickable: true,

    transitions: {
        // Animate label position transitions in order to help tracking when labels are moving
        getPosition: {
            duration: 100,
            type: "interpolation",
        },

        // Prevent changed label texts from appearing before the label background
        // has moved into place
        getColor: {
            duration: 100,
            type: "interpolation",
            enter: ([r, g, b]: Color) => [r, g, b, 0],
            easing: (t: number) => _.floor(t),
        },

        // Prevent changed background border from appearing before the label text
        getBorderColor: {
            duration: 1,
            type: "interpolation",
            enter: ([r, g, b]: Color) => [r, g, b, 0],
            easing: (t: number) => _.floor(t),
        },

        // Cosmetic effects for fading in the label background
        getBackgroundColor: {
            duration: 1,
            type: "spring",
            enter: ([r, g, b]: Color) => [r, g, b, 0],
        },
    },

    // Ensure labels honor pixel size in screen space
    extensions: [new FixedSizeExtension()],
};

const getCumulativeDistance = (well_xyz: Position[]): number[] => {
    const cumulativeDistance = [0];
    for (let i = 1; i < well_xyz.length; i++) {
        const p1 = well_xyz[i - 1];
        const p2 = well_xyz[i];

        if (!p1 || !p2) {
            continue;
        }

        const v0 = new Vector3(p1);
        const v1 = new Vector3(p2);
        const distance = v0.distance(v1);

        cumulativeDistance.push(cumulativeDistance[i - 1] + distance);
    }
    return cumulativeDistance;
};

/**
 * The `WellLabelLayer` class extends the `MergedTextLayer` to provide functionality for rendering well
 * labels in a subsurface viewer. It includes methods for calculating label positions and angles based
 * on well trajectory data and the current viewport.
 *
 * @template WellLabelLayerData - The data type for the well label layer.
 * @template WellLabelLayerProps - The properties type for the well label layer.
 */
export class WellLabelLayer extends MergedTextLayer<
    WellLabelLayerData,
    WellLabelLayerProps
> {
    protected override getSubLayerProps(sublayerProps?: {
        id?: string;
        updateTriggers?: Record<string, unknown[]>;
        [propName: string]: unknown;
    }) {
        const angleUpdateTriggers =
            sublayerProps?.updateTriggers?.["getAngle"] ?? [];
        const positionUpdateTriggers =
            sublayerProps?.updateTriggers?.["getPosition"] ?? [];
        const angleTrigger = this.context.viewport.constructor === OrbitViewport
                        ? (this.context.viewport as OrbitViewport)
                              .cameraPosition
                        : null; // No need for angle update trigger for OrthographicViewport and change in camera.
        const newProps = {
            ...sublayerProps,
            getPosition: (d: WellFeature) => {
                return this.getAnnotationPosition(
                    d,
                    this.props.getPositionAlongPath
                );
            },
            getAngle: (d: WellFeature) => this.getLabelAngle(d),
            updateTriggers: {
                ...sublayerProps?.updateTriggers,
                getAngle: [
                    ...angleUpdateTriggers,
                    angleTrigger,
                    this.props.orientation,
                    this.props.getPositionAlongPath,
                ],
                getPosition: [
                    ...positionUpdateTriggers,
                    this.context.viewport.cameraPosition,
                    this.props.getPositionAlongPath,
                ],

                all: [
                    angleTrigger,
                    this.props.getPositionAlongPath,
                ],
            },
        };

        return super.getSubLayerProps(newProps);
    }

    public override shouldUpdateState(params: UpdateParameters<this>): boolean {
        if (
            params.changeFlags.viewportChanged &&
            (params.props.autoPosition ||
                "tangent" === params.props.orientation)
        ) {
            return true;
        }
        return super.shouldUpdateState(params);
    }

    public override updateState(params: UpdateParameters<this>): void {
        if (params.props.autoPosition && params.changeFlags.viewportChanged) {
            // Trigger dataChanged if labels move due to auto-positioning
            params.changeFlags.dataChanged = "autoPosition";
        }
        super.updateState(params);
    }

    protected getLabelAngle(well: WellFeature) {
        if (this.props.orientation === "horizontal") {
            return 0;
        }

        const position = Number(this.props.getPositionAlongPath);
        _.clamp(position, 0, 1);
        const a = this.getVectorAlongTrajectory(position, well);
        return a[0];
    }

    /**
     * Get the position of the annotation
     * @param well_data Well trajectory
     * @param annotationPosition position of the annotation along the trajectory
     * @returns world position of the annotation
     */
    protected getAnnotationPosition(
        well_data: WellFeature,
        annotationPosition: WellLabelLayerProps["getPositionAlongPath"]
    ): Position {
        let fraction = Number(annotationPosition);
        if (typeof annotationPosition === "function") {
            fraction = annotationPosition(well_data);
        }

        fraction = _.clamp(fraction, 0, 1);

        // Return a position as a fraction down the trajectory
        return this.getVectorAlongTrajectory(fraction, well_data)[1];
    }

    /**
     * Get angle and position at a given fraction down the trajectory.
     * @param fraction Fraction down the trajectory [0, 1]
     * @param wellData Well trajectory
     */
    protected getVectorAlongTrajectory(
        fraction: number,
        wellData: WellFeature
    ): [number, Point3D] {
        if (!wellData) {
            return [0, [0, 0, 0]];
        }

        const trajectory = getTrajectory(wellData, undefined);

        if (_.isUndefined(trajectory) || trajectory.length < 2) {
            return [0, [0, 0, 0]];
        }

        const { width, height } = this.context.viewport;

        const candidateFractions = [0.5, 0.25, 0.75, 0.125, 0.87, 0.37, 0.62];

        const cumulativeDistance = getCumulativeDistance(trajectory);

        const zSign = this.props.zIncreasingDownwards
            ? new Vector3(1, 1, -1)
            : new Vector3(1, 1, 1);

        while (candidateFractions.length != 0) {
            const targetDistance =
                cumulativeDistance[cumulativeDistance.length - 1] * fraction;

            // Find the index of the segment that contains the target distance
            let targetIndex = 0;
            for (let i = 0; i < cumulativeDistance.length - 1; i++) {
                if (cumulativeDistance[i + 1] < targetDistance) {
                    continue;
                }
                targetIndex = i;
                break;
            }

            const segmentBegin = new Vector3([...trajectory[targetIndex]]);
            const segmentEnd = new Vector3([...trajectory[targetIndex + 1]]);

            // Invert z if z is increasing downwards
            segmentBegin.multiply(zSign);
            segmentEnd.multiply(zSign);

            const distanceAlongTrajectory1 = cumulativeDistance[targetIndex];
            const distanceAlongTrajectory2 =
                cumulativeDistance[targetIndex + 1];

            const lineDistance =
                distanceAlongTrajectory2 - distanceAlongTrajectory1;
            const fractionOnLine =
                (targetDistance - distanceAlongTrajectory1) / lineDistance;

            // Linear interpolation between segmentBegin and segmentEnd
            const labelPosition = new Vector3(segmentBegin).lerp(
                segmentEnd,
                fractionOnLine
            );

            // If autoPosition is enabled, check if the label is outside the viewport
            // and if so, try the next candidate fraction
            if (this.props.autoPosition) {
                const ps = this.project(labelPosition);
                if (ps[0] < 0 || ps[0] > width || ps[1] < 0 || ps[1] > height) {
                    // If the label is outside view/camera, reposition it
                    fraction = candidateFractions.shift() ?? 0;
                    continue;
                }
            }

            const p1 = this.project(segmentBegin);
            const p2 = this.project(segmentEnd);

            const v = new Vector2(p2[0] - p1[0], -(p2[1] - p1[1]));
            v.normalize();
            const rad = Math.atan2(v[1], v[0]) as number;
            const deg = rad * (180 / Math.PI);
            let a = deg;

            if (deg > 90) {
                a = deg - 180;
            } else if (deg < -90) {
                a = deg + 180;
            }

            return [a, labelPosition.toArray() as Point3D];
        }

        // Default to well head of no valid position is found in viewport
        return [0, trajectory[0] as Point3D];
    }

    getPickingInfo({ info }: { info: PickingInfo }) {
        const name = info.object?.properties?.name ?? "";
        const pos = this.state.labelPositions.get(name)!;
        const names = this.state.clusters.get(pos);

        info.object = { ...info.object, wellLabels: names };
        return info;
    }
}

WellLabelLayer.defaultProps = DEFAULT_PROPS as DefaultProps<
    TextLayerProps<unknown>
>;

WellLabelLayer.layerName = "WellLabelLayer";
