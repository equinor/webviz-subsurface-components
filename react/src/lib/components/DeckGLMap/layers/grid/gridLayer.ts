import { CompositeLayer } from "@deck.gl/core";
import { ExtendedLayerProps } from "../utils/layerTools";
import { RGBAColor } from "@deck.gl/core/utils/color";
import { Position } from "@deck.gl/core/utils/positions";
import { PolygonLayer } from "@deck.gl/layers";
import { COORDINATE_SYSTEM } from "@deck.gl/core";
import { Feature } from "geojson";
import { Position2D } from "@deck.gl/core/utils/positions";
import { PolygonLayerProps } from "@deck.gl/layers";

// These are the data GridLayer expects.
type CellData = {
    i: number;
    j: number;
    z: number; // cell depth
    cs: [Position2D, Position2D, Position2D, Position2D]; // 4 corners
    vs: [number]; // time dependent values
};
type GridData = CellData[];

// These are the data PolygonLayer expects.
type CellProperties = {
    color: RGBAColor;
    i: number;
    j: number;
    depth: number;
    value: number;
};
interface PolygonData {
    polygon: Position[];
    properties: CellProperties;
}

export type GridLayerProps<D> = ExtendedLayerProps<D>;

const defaultProps = {
    name: "Grid",
    pickable: true,
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
};

export default class GridLayer extends CompositeLayer<
    GridData,
    GridLayerProps<GridData>
> {
    initializeState(): void {
        this.setState({
            ti: 0, // timestep no
        });

        const updateTimeStepNo = () => {
            const ti_next = this.state.ti + 1;
            this.setState({
                ti: ti_next,
            });
        };

        // For now just cycle over the timesteps.
        setInterval(updateTimeStepNo, 2500);
    }

    // For now, use `any` for the picking types because this function should
    // recieve PickInfo<FeatureCollection>, but it recieves PickInfo<Feature>.
    //eslint-disable-next-line
    getPickingInfo({ info }: { info: any }): any {
        if (!info.object) return info;
        const feature: Feature = info.object;

        return {
            ...info,
            properties: [
                { name: "i", value: feature?.properties?.["i"] ?? "NA" },
                { name: "j", value: feature?.properties?.["j"] ?? "NA" },
                {
                    name: "depth:",
                    value: feature?.properties?.["depth"] ?? "NA",
                },
                {
                    name: "value:",
                    value: feature?.properties?.["value"],
                    color: feature?.properties?.["color"],
                },
            ],
        };
    }

    renderLayers(): PolygonLayer<PolygonData>[] {
        const data = this.props.data as GridData;
        if (!data) {
            return [];
        }

        // Wrap around timestep if necessary.
        if (this.state.ti >= (data?.[0]?.vs.length ?? 1)) {
            this.setState({
                ti: 0,
            });
        }

        const layer = new PolygonLayer<PolygonData>(
            this.getSubLayerProps<PolygonData, PolygonLayerProps<PolygonData>>({
                data: makeLayerData(data, this.state.ti),
                id: "grid-layer",
                getFillColor: (d: PolygonData) => d.properties.color,
                getLineColor: [0, 0, 0, 255],
                getLineWidth: 1,
                stroked: true,
                filled: true,
                lineWidthMinPixels: 1,
                visible: this.props.visible,
            })
        );

        return [layer];
    }
}

GridLayer.layerName = "GridLayer";
GridLayer.defaultProps = defaultProps;

//================= Local help functions. ==================
function makeLayerData(data: GridData, ti: number): PolygonData[] {
    const polygons: PolygonData[] = data.map(function (
        cell: CellData
    ): PolygonData {
        const v = cell.vs[ti];

        // temporary hardcoded colors.
        const r = 255 - v * 100;
        const g = 255 - v * 100;
        const b = 255 * v;

        return {
            polygon: cell.cs, // 4 corners
            properties: {
                color: [r, g, b],
                i: cell.i,
                j: cell.j,
                depth: cell.z,
                value: cell.vs[ti],
            },
        };
    });

    return polygons;
}
