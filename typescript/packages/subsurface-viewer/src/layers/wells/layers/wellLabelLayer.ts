import { createIterable, type DefaultProps, type UpdateParameters } from "@deck.gl/core";
import type { TextLayerProps } from "@deck.gl/layers";
import { TextLayer } from "@deck.gl/layers";
import type { Feature, Position } from "geojson";
import _, { bind } from "lodash";
import { Vector2, Vector3 } from "math.gl";
import type { Position3D } from "../../utils/layerTools";
import type { WellFeature } from "../types";
import { getTrajectory } from "../utils/trajectory";

type WellLabelLayerData = WellFeature;

/*
const test = (d: WellFeature, other: any) => {
    const text = d.properties.name + " 123456789";
    console.log("test() called");
    //console.log("text ", text);
    //console.log("other ", other);
    return text;
};
*/

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
export type WellLabelLayerProps = TextLayerProps<WellLabelLayerData> & {
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

    /**
     * Merge well names that are close to each other.
     */
    mergeLabels?: boolean;
};

const DEFAULT_PROPS: DefaultProps<WellLabelLayerProps> = {
    id: "well-label-layer",
    autoPosition: false,
    getPositionAlongPath: 0,
    getText: (d: WellFeature) => d.properties.name,
    //getText: test,
    /*
    getText: (d: WellFeature) => {
        console.log("getText() called");
        return d.properties.name;
    },
    */
    getAlignmentBaseline: "bottom",
    getSize: 10,
    getColor: [0, 0, 0, 255],
    getBackgroundColor: { type: "accessor", value: [100, 255, 255, 255] },
    //getBackgroundColor: (d: WellFeature) => [100, 255, 255, 255],
    zIncreasingDownwards: true,
    orientation: LabelOrientation.HORIZONTAL,
    backgroundPadding: [5, 1, 5, 1],
    getBorderColor: [0, 0, 0, 255],
    getBorderWidth: 1,

    // Animate label position transitions in order to help tracking when labels are moving
    transitions: {
        getPosition: {
            duration: 100,
            type: "spring",
        },
    },

    mergeLabels: true,
    maxWidth: 100,
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
 * The `WellLabelLayer` class extends the `TextLayer` to provide functionality for rendering well labels
 * in a subsurface viewer. It includes methods for calculating label positions and angles based on well
 * trajectory data and the current viewport.
 *
 * @template WellLabelLayerData - The data type for the well label layer.
 * @template WellLabelLayerProps - The properties type for the well label layer.
 */
export class WellLabelLayer extends TextLayer<
    WellLabelLayerData,
    WellLabelLayerProps
> {
    state!: {
        /**
         * Collection of well head clusters.
         */
        headClusters: Map<Position3D, string[]>;
    } & TextLayer<WellLabelLayerData, WellLabelLayerProps>["state"];

    protected override getSubLayerProps(sublayerProps?: {
        id?: string;
        updateTriggers?: Record<string, unknown[]>;
        [propName: string]: unknown;
    }) {
        const angleUpdateTriggers =
            sublayerProps?.updateTriggers?.["getAngle"] ?? [];
        const positionUpdateTriggers =
            sublayerProps?.updateTriggers?.["getPosition"] ?? [];
        const textUpdateTriggers =
            sublayerProps?.updateTriggers?.["getText"] ?? [];

        const newProps = {
            ...sublayerProps,
            getPosition: (d: WellFeature) => {
                return this.getAnnotationPosition(
                    d,
                    this.props.getPositionAlongPath
                );
            },
            getAngle: (d: WellFeature) => this.getLabelAngle(d),
            getText: (d: WellFeature) => {
                console.log("this.getText(d) called");
                return this.getText(d);
            },
            getColor: (d: WellFeature) => this.getColor(d),
            getBackgroundColor: (d: WellFeature) => this.getBackgroundColor(d),
            updateTriggers: {
                ...sublayerProps?.updateTriggers,
                getAngle: [
                    ...angleUpdateTriggers,
                    this.context.viewport.cameraPosition,
                    this.props.orientation,
                    this.props.getPositionAlongPath,
                ],
                getPosition: [
                    ...positionUpdateTriggers,
                    this.context.viewport.cameraPosition,
                    this.props.getPositionAlongPath,
                ],
                getText: [
                    ...textUpdateTriggers,
                    this.state.headClusters,
                    this.props.mergeLabels,
                    this.state.getText,
                ],
                //getBackgroundColor: [this.state.headClusters],
                //all: [...textUpdateTriggers, this.state.getText],
            },
        };

        const tmpProps = super.getSubLayerProps(newProps);

        return tmpProps;
    }

    public override shouldUpdateState(params: UpdateParameters<this>): boolean {
        if (
            params.changeFlags.viewportChanged === true &&
            (params.props.autoPosition ||
                "tangent" === params.props.orientation)
        ) {
            return true;
        }

        if (params.changeFlags.dataChanged) {
            return true;
        }

        return super.shouldUpdateState(params);
    }

    protected updateInstanceState() {
        const { data } = this.props;
        let numInstances = 0;
        const startIndices = [0];

        const { iterable } = createIterable(data);

        for (const object of iterable) {
            const text = Array.from(this.getText(object));
            numInstances += text.length;
            startIndices.push(numInstances);
        }

        this.setState({
            numInstances,
            startIndices,
        });
    }

    public override updateState(params: UpdateParameters<this>): void {
        super.updateState(params);
        if (params.changeFlags.dataChanged) {
            const headClusters = this.mergeWellNames(
                this.props.data as WellFeature[]
            );

            this.setState({
                //...this.state,
                headClusters,
                getText: bind(this.getText, this),
            });

            this.updateInstanceState();
        }
    }

    protected getText(d: WellFeature): string {
        const wellName = d.properties?.["name"] ?? "";

        if (!this.props.mergeLabels) {
            return wellName;
        }

        const trajectory = getTrajectory(d, undefined);
        if (!trajectory) {
            return wellName;
        }

        // Get the well head position
        const wellHeadPosition = trajectory[0] as Position3D;

        const wellHeadCluster = this.state.headClusters.get(wellHeadPosition);

        if (wellHeadCluster && wellHeadCluster[0] === wellName) {
            return wellName + " ...";
        }

        return wellName;
    }

    protected getColor(d: WellFeature): number[] {
        const wellName = d.properties?.["name"] ?? "";
        const wellHeadPosition = getTrajectory(d, undefined)?.[0] as Position3D;
        const wellHeadCluster = this.state.headClusters.get(wellHeadPosition);
        if (wellHeadCluster && wellHeadCluster[0] === wellName) {
            return [0, 0, 0, 255];
        }
        return [255, 0, 0, 255];
    }

    protected getBackgroundColor(d: WellFeature): number[] {
        const wellName = d.properties?.["name"] ?? "";
        const wellHeadPosition = getTrajectory(d, undefined)?.[0] as Position3D;
        const wellHeadCluster = this.state.headClusters.get(wellHeadPosition);
        if (wellHeadCluster && wellHeadCluster[0] === wellName) {
            return [0, 0, 0, 255];
        }
        return [255, 0, 0, 255];
    }

    protected mergeWellNames(wells: WellFeature[]): Map<Position3D, string[]> {
        const wellNames = new Map<Position3D, string[]>();
        for (const well of wells) {
            const trajectory = getTrajectory(well, undefined);
            if (!trajectory) {
                continue;
            }
            const head = trajectory[0] as Position3D;
            const name = well.properties?.["name"] ?? "";
            if (wellNames.has(head)) {
                const names = wellNames.get(head);
                if (names) {
                    names.push(name);
                }
            } else {
                wellNames.set(head, [name]);
            }
        }
        return wellNames;
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

        // Return a pos "annotation_position" percent down the trajectory
        const pos = this.getVectorAlongTrajectory(fraction, well_data)[1];

        const label = well_data.properties?.["name"] ?? "";
        const labelSize = label.length;

        const view_from = new Vector3(this.context.viewport.cameraPosition);
        const dir = new Vector3([
            view_from[0] - pos[0],
            view_from[1] - pos[1],
            view_from[2] - pos[2],
        ]);
        dir.normalize();

        let meanCharVal = 0;
        for (let i = 0; i < labelSize; i++) {
            const a = label.charCodeAt(i) - 32; // 32: ascii value for first relevant symbol.
            meanCharVal += a;
        }
        meanCharVal = meanCharVal / labelSize; // unique text id for each label

        const x = Math.floor(pos[0]) % 9;
        const y = Math.floor(pos[1]) % 9;
        const pId = x + y; // unique position id for each label

        // Perturb position towards camera to avoid z-buffer fighting between labels.
        // Distance dependent on unique properties of label so that no two labels
        // are offset equally.
        const offset = labelSize + meanCharVal + pId;

        // Increase perturbation for labels at the top of the trajectory, where the
        // cluttering is likely most prominent.
        const zOffset = fraction > 0 ? offset : offset * 5;

        return [
            pos[0] + dir[0] * offset,
            pos[1] + dir[1] * offset,
            pos[2] + dir[2] * zOffset,
        ];
    }

    /**
     * Get angle and position at a given fraction down the trajectory.
     * @param fraction Fraction down the trajectory [0, 1]
     * @param wellData Well trajectory
     */
    protected getVectorAlongTrajectory(
        fraction: number,
        wellData: WellFeature
    ): [number, Position3D] {
        if (!wellData) {
            return [0, [0, 0, 0]];
        }

        const trajectory = getTrajectory(wellData, undefined);

        if (_.isUndefined(trajectory) || trajectory.length < 2) {
            return [0, [0, 0, 0]];
        }

        const width = this.context.viewport.width;
        const height = this.context.viewport.height;

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

            return [a, labelPosition.toArray() as Position3D];
        }

        // Default to well head of no valid position is found in viewport
        return [0, trajectory[0] as Position3D];
    }
}

WellLabelLayer.defaultProps = DEFAULT_PROPS as DefaultProps<
    TextLayerProps<unknown>
>;

WellLabelLayer.layerName = "WellLabelLayer";
