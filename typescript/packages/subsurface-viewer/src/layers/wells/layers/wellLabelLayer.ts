import type { DefaultProps, Position, UpdateParameters } from "@deck.gl/core";
import { OrbitViewport } from "@deck.gl/core";
import type { TextLayerProps } from "@deck.gl/layers";
import { TextLayer } from "@deck.gl/layers";
import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import _ from "lodash";
import { Vector2, Vector3 } from "math.gl";
import type { Position3D } from "../../utils/layerTools";
import { getTrajectory } from "../utils/trajectory";

type WellLabelLayerData = Feature<Geometry, GeoJsonProperties>;

export enum LabelOrientation {
    HORIZONTAL = "horizontal",
    TANGENT = "tangent",
};

export type WellLabelLayerProps = TextLayerProps<WellLabelLayerData> & {
    autoPosition?: boolean;
    getPositionAlongPath?: number | ((d: Feature) => number);
    zIncreasingDownwards?: boolean;
    orientation?: LabelOrientation;
};

const DEFAULT_PROPS: DefaultProps<WellLabelLayerProps> = {
    id: "well-label-layer",
    autoPosition: false,
    getPositionAlongPath: 0,
    getText: (d: Feature) => {
        const name = d.properties?.["name"];
        return name;
    },
    getAlignmentBaseline: "bottom",
    getSize: 10,
    getColor: [0, 0, 0, 255],
    zIncreasingDownwards: true,
    orientation: LabelOrientation.HORIZONTAL,
    backgroundPadding: [5, 1, 5, 1],
};

export class WellLabelLayer extends TextLayer<
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

        const newProps = {
            ...sublayerProps,
            getPosition: (d: Feature) => {
                return this.getAnnotationPosition(
                    d,
                    this.props.getPositionAlongPath
                );
            },
            getAngle: (d: Feature) => this.getLabelAngle(d),
            updateTriggers: {
                ...sublayerProps?.updateTriggers,
                getAngle: [
                    ...angleUpdateTriggers,
                    this.context.viewport.cameraPosition,
                ],
                getPosition: [
                    ...positionUpdateTriggers,
                    this.context.viewport.cameraPosition,
                ],
            },
        };

        return super.getSubLayerProps(newProps);
    }

    public override shouldUpdateState(params: UpdateParameters<this>): boolean {
        if (
            params.changeFlags.viewportChanged === true &&
            (params.props.autoPosition ||
                "tangent" === params.props.orientation)
        ) {
            return true;
        }
        return super.shouldUpdateState(params);
    }

    protected getLabelAngle(well: Feature) {
        if (this.props.orientation === "horizontal") {
            return 0;
        }

        const percentage = Number(this.props.getPositionAlongPath);
        _.clamp(percentage, 0, 100);
        const a = this.getTrajPointAtPercentage(percentage, well);
        return a[0];
    }

    /**
     * Get the position of the annotation
     * @param well_data Well trajectory
     * @param annotationPosition position of the annotation along the trajectory
     * @returns world position of the annotation
     */
    protected getAnnotationPosition(
        well_data: Feature,
        annotationPosition: WellLabelLayerProps["getPositionAlongPath"]
    ): Position {
        const view_is_3d = this.context.viewport.constructor === OrbitViewport;
        let percentage = Number(annotationPosition);
        if (typeof annotationPosition === "function") {
            percentage = annotationPosition(well_data);
        }
        _.clamp(percentage, 0, 100);

        // Return a pos "annotation_position" percent down the trajectory
        let pos = this.getTrajPointAtPercentage(percentage, well_data)[1];

        // Perturb position towards camera to avoid z-buffer fighting between labels.
        // Distance dependent on unique properties of label so that no two labels are offset equally.
        const label = well_data.properties?.["name"] ?? "a";
        const labelSize = label.length;

        const view_from = new Vector3(this.context.viewport.cameraPosition);
        const dir = new Vector3([
            view_from[0] - pos[0],
            view_from[1] - pos[1],
            view_from[2] - pos[2],
        ]);
        const camDist = dir.magnitude();
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

        const offset = labelSize + meanCharVal + pId;

        if (view_is_3d) {
            pos = [
                pos[0] + dir[0] * offset,
                pos[1] + dir[1] * offset,
                pos[2] + dir[2] * offset,
            ];
        } else {
            pos = [
                pos[0],
                pos[1],
                pos[2] + 0.1 * camDist * (labelSize + meanCharVal + pId),
            ];
        }

        return pos ?? [0, 0, 0];
    }

    /**
     * Return angle and position a given percentage down the trajectory.
     */
    protected getTrajPointAtPercentage(
        percent: number,
        wellData: Feature
    ): [number, Position3D] {
        if (!wellData) {
            return [0, [0, 0, 0]];
        }

        const well_xyz = getTrajectory(wellData, undefined);

        const w = this.context.viewport.width;
        const h = this.context.viewport.height;

        const percentages = [50, 25, 75, 12.5, 87.5, 37.5, 62.5];

        const n = well_xyz?.length ?? 2;
        if (well_xyz && n >= 2) {
            while (percentages.length != 0) {
                const i = Math.min(Math.floor((percent / 100) * n), n - 2);
                const pi1 = [...well_xyz[i]];
                const pi2 = [...well_xyz[i + 1]];

                if (this.props.zIncreasingDownwards) {
                    pi1[2] = -pi1[2];
                    pi2[2] = -pi2[2];
                }

                const p1 = new Vector2(this.project(pi1 as number[]));
                const p2 = new Vector2(this.project(pi2 as number[]));
                const p: Position3D = [
                    pi1[0] + (pi2[0] - pi1[0]) / 2,
                    pi1[1] + (pi2[1] - pi1[1]) / 2,
                    pi1?.[2] ?? 0 + (pi2?.[2] ?? 0 - (pi1?.[2] ?? 0)) / 2,
                ];

                if (this.props.autoPosition) {
                    const ps = this.project(p);
                    if (ps[0] < 0 || ps[0] > w || ps[1] < 0 || ps[1] > h) {
                        // If the label is outside view/camera, reposition it
                        percent = percentages.shift() as number;
                        continue;
                    }
                }

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

                return [a, p];
            }
        }
        return [0, [0, 0, 0]];
    }
}

WellLabelLayer.defaultProps = DEFAULT_PROPS as DefaultProps<
    TextLayerProps<unknown>
>;

WellLabelLayer.layerName = "WellLabelLayer";
