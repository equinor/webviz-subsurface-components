import { isEqual } from "lodash";
import type React from "react";

import type { Color, PickingInfo, UpdateParameters } from "@deck.gl/core";
import { CompositeLayer } from "@deck.gl/core";

import type { Material } from "../gpglLayers/typeDefs";
import { PrivatePolylinesLayer } from "../polylines/privatePolylinesLayer";
import {
    GpglValueMappedSurfaceLayer,
    type ValueMappedTriangleProps,
} from "../gpglLayers/gpglValueMappedSurfaceLayer";

import { createPropertyData, computeBoundingBox } from "../utils/layerTools";
import type {
    ExtendedLayerProps,
    LayerPickInfo,
    PropertyDataType,
    ReportBoundingBoxAction,
} from "../utils/layerTools";
import type { ColormapProps, ColormapSetup } from "../utils/colormapTools";

import type { Point3D } from "../../utils";
import { addPoints3D } from "../../utils";

/**
 * Cage properties.
 *
 * Definition of the cage and its visual properties.
 * The cage, specified by an origin and 3 edges, represents the bounds of the seismic data.
 */
export interface CageProps {
    /**
     * Origin point of the cage.
     */
    origin: Point3D;
    /**
     * Edge U of the cage.
     */
    edgeU: Point3D;
    /**
     * Edge V of the cage.
     */
    edgeV: Point3D;
    /**
     * Edge W of the cage.
     */
    edgeW: Point3D;

    /**
     * The units of the line width, one of `'meters'`, `'common'`, and `'pixels'`.
     * Default "meters".
     */
    widthUnits: "meters" | "common" | "pixels";

    /**
     * Line width defined in width units. Default 2.
     */
    lineWidth: number;

    /**
     * Line color defined as RGB or RGBA array. Each component is in 0-255 range.
     */
    color: Color;

    /**
     * Cage visibility. Default true.
     */
    visible: boolean;
}

export type SeismicFenceProps = ValueMappedTriangleProps;

export interface SeismicLayerProps extends ExtendedLayerProps {
    /**
     * Cage properties
     */
    cage: CageProps;

    /**
     * Seismic fences.
     * A fence is a list of triangles with texture coordinates associated to a 2D array of seismic values
     * that will be mapped on the fence.
     * It can easily be used to display seismic I, J or K slices.
     */
    seismicFences: SeismicFenceProps[];
    showMesh: boolean;

    colormap?: ColormapProps;

    colormapSetup?: ColormapSetup;

    /** Surface material properties.
     * material: true  = default material, coloring depends on surface orientation and lighting.
     *           false = no material,  coloring is independent on surface orientation and lighting.
     *           or full spec:
     *      material: {
     *           ambient: 0.35,
     *           diffuse: 0.6,
     *           shininess: 32,
     *           specularColor: [255, 255, 255],
     *       }
     */
    material: Material;

    smoothShading: boolean;
    enableLighting: boolean;

    /**
     * Layer visibility. Default true.
     */
    visible: boolean;

    /**
     * Enable/disable depth testing when rendering layer. Default true.
     */
    depthTest?: boolean;

    /**
     * If true means that input z values are interpreted as depths.
     * For example depth of z = 1000 corresponds to -1000 on the z axis. Default true.
     */
    ZIncreasingDownwards: boolean;

    // Non public properties:
    reportBoundingBox?: React.Dispatch<ReportBoundingBoxAction>;
}

const defaultCageProps = {
    widthUnits: "meters",
    lineWidth: 2,
    color: [255, 100, 0],
    visible: true,
};

const defaultProps = {
    "@@type": "SeismicLayer",
    name: "SeismicLayer",
    id: "seismic-layer",
    cage: defaultCageProps,
    seismicFences: [],
    material: false,
    pickable: true,
    visible: true,
    depthTest: true,
    ZIncreasingDownwards: true,
};

interface ICageDataAttributes {
    length: number;
    startIndices: Uint32Array;
    attributes: {
        getPath: {
            value: Float32Array;
            size: number;
        };
    };
}

export default class SeismicLayer extends CompositeLayer<SeismicLayerProps> {
    initializeState(): void {
        const cageAttributes = this.rebuildCageAttributes(true);
        this.setState({
            cageAttributes,
        });
    }

    updateState({ props, oldProps }: UpdateParameters<SeismicLayer>): void {
        const needs_reload_cage =
            !isEqual(props.cage?.origin, oldProps.cage?.origin) ||
            !isEqual(props.cage?.edgeU, oldProps.cage?.edgeU) ||
            !isEqual(props.cage?.edgeV, oldProps.cage?.edgeV) ||
            !isEqual(props.cage?.edgeW, oldProps.cage?.edgeW) ||
            !isEqual(props.ZIncreasingDownwards, oldProps.ZIncreasingDownwards);

        if (needs_reload_cage) {
            const cageAttributes = this.rebuildCageAttributes(false);
            this.setState({
                ...this.state,
                cageAttributes,
            });
        }

        const needs_reload_fences =
            !isEqual(
                props.seismicFences.length,
                oldProps.seismicFences?.lastIndexOf
            ) ||
            props.seismicFences.some((fence, index) => {
                const oldFence = oldProps.seismicFences?.[index];
                return (
                    // do not use isEqual for performance: it iterates on each element
                    fence.topology !== oldFence?.topology ||
                    fence.vertices !== oldFence?.vertices ||
                    fence.normals !== oldFence?.normals ||
                    fence.texCoords !== oldFence?.texCoords ||
                    //fence.seismicData !== oldFence?.seismicData ||
                    fence.vertexIndices.value !==
                        oldFence?.vertexIndices.value ||
                    fence.vertexIndices.size !== oldFence?.vertexIndices.size
                );
            });

        if (needs_reload_fences) {
            const fences = this.rebuildFencesAttributes();
            this.setState({
                ...this.state,
                seismicFences: fences ?? [],
            });
        }
    }

    private rebuildCageAttributes(
        reportBoundingBox: boolean
    ): ICageDataAttributes | null {
        const cageDataArrays = this.loadCageData();
        if (
            typeof this.props.reportBoundingBox === "function" &&
            reportBoundingBox
        ) {
            const boundingBox = computeBoundingBox(cageDataArrays.positions);
            this.props.reportBoundingBox({ layerBoundingBox: boundingBox });
        }

        return {
            length: cageDataArrays.linesCount,
            startIndices: cageDataArrays.startIndices,
            attributes: {
                getPath: {
                    value: cageDataArrays.positions,
                    size: 3,
                },
            },
        };
    }

    private loadCageData(): {
        positions: Float32Array;
        linesCount: number;
        startIndices: Uint32Array;
    } {
        // build the list of vertices to represent the cage
        const cage = this.props.cage;
        const pO = cage.origin;
        const pU = addPoints3D(cage.origin, cage.edgeU);
        const pV = addPoints3D(cage.origin, cage.edgeV);
        const pW = addPoints3D(cage.origin, cage.edgeW);
        const pUV = addPoints3D(pU, cage.edgeV);
        const pUW = addPoints3D(pU, cage.edgeW);
        const pVW = addPoints3D(pV, cage.edgeW);
        const pUVW = addPoints3D(pUV, cage.edgeW);
        const vertices: number[] = [
            ...pO, // base side
            ...pU,
            ...pUV,
            ...pV,
            ...pO,
            ...pW, // front side
            ...pUW,
            ...pU,
            ...pUV, // right side
            ...pUVW,
            ...pUW,
            ...pW, // top side
            ...pVW,
            ...pUVW,
            ...pVW, // junction
            ...pV, // close back and left sides
        ];

        return {
            positions: new Float32Array(vertices),
            linesCount: 1,
            startIndices: new Uint32Array([0, vertices.length / 3]),
        };
    }

    private rebuildFencesAttributes(): ValueMappedTriangleProps[] {
        return this.props.seismicFences;
    }

    getPickingInfo({ info }: { info: PickingInfo }): LayerPickInfo {
        if (!info.color) {
            return info;
        }

        const layer_properties: PropertyDataType[] = [];

        const zScale = this.props.modelMatrix ? this.props.modelMatrix[10] : 1;
        if (info.coordinate?.[2] !== undefined) {
            const depth =
                (this.props.ZIncreasingDownwards
                    ? -info.coordinate[2]
                    : info.coordinate[2]) / Math.max(0.001, zScale);
            layer_properties.push(createPropertyData("Depth", depth));
        }

        return {
            ...info,
            properties: layer_properties,
        };
    }

    renderLayers(): [PrivatePolylinesLayer?, GpglValueMappedSurfaceLayer?] {
        const cage = this.state["cageAttributes"] as ICageDataAttributes;
        const cageLayer = new PrivatePolylinesLayer(
            this.getSubLayerProps({
                id: "polylines-layer",
                widthUnits: this.props.cage.widthUnits,
                billboard: true,
                jointRounded: true,
                capRounded: true,
                data: cage,
                _pathType: "open",
                getColor: () => this.props.cage.color,
                getWidth: () => this.props.cage.lineWidth,

                updateTriggers: {
                    getColor: [this.props.cage.color],
                    getWidth: [this.props.cage.lineWidth],
                },
                pickable: this.props.pickable,
                depthTest: this.props.depthTest,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            })
        );

        const seismicFences = this.state[
            "seismicFences"
        ] as ValueMappedTriangleProps[];
        const seismicLayer = new GpglValueMappedSurfaceLayer(
            this.getSubLayerProps({
                id: `seismic-fence-layer`,
                valueMappedTriangles: seismicFences,
                showMesh: this.props.showMesh,
                colormap: this.props.colormap,
                colormapSetup: this.props.colormapSetup,
                pickable: this.props.pickable,
                depthTest: this.props.depthTest,
                ZIncreasingDownwards: this.props.ZIncreasingDownwards,
            })
        );

        return [cageLayer, seismicLayer];
    }
}

SeismicLayer.layerName = "SeismicLayer";
SeismicLayer.defaultProps = defaultProps as unknown as SeismicLayerProps;
