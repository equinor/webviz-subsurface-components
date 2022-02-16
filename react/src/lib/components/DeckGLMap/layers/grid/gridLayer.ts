import { CompositeLayer } from "@deck.gl/core";
import { ExtendedLayerProps } from "../utils/layerTools";
import { RGBAColor, RGBColor } from "@deck.gl/core/utils/color";
import { Position } from "@deck.gl/core/utils/positions";
import { PolygonLayer } from "@deck.gl/layers";
import { COORDINATE_SYSTEM } from "@deck.gl/core";
import { Feature } from "geojson";
import { Position3D } from "@deck.gl/core/utils/positions";
import { PolygonLayerProps } from "@deck.gl/layers";
import { layersDefaultProps } from "../layersDefaultProps";
import { DeckGLLayerContext } from "../../components/Map";
import { colorTablesArray, rgbValues } from "@emerson-eps/color-tables/";

function getColorMapColors(
    colorMapName: string,
    colorTables: colorTablesArray
): RGBColor[] {
    const colors: RGBColor[] = [];

    for (let i = 0; i < 256; i++) {
        const value = i / 255.0;
        const rgb = rgbValues(value, colorMapName, colorTables);
        let color: RGBColor = [155, 255, 255];
        if (rgb != undefined) {
            if (Array.isArray(rgb)) {
                color = [rgb[0], rgb[1], rgb[2]];
            } else {
                color = [rgb.r, rgb.g, rgb.b];
            }
        }

        colors.push(color);
    }

    return colors;
}

// These are the data GridLayer expects.
type CellData = {
    i: number;
    j: number;
    z: number; // cell depth
    cs: [Position3D, Position3D, Position3D, Position3D]; // 4 corners
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
export interface GridLayerProps<D> extends ExtendedLayerProps<D> {
    // Name of color map.
    colorMapName: string;

    // Min and max property values.
    valueRange: [number, number];

    // Use color map in this range.
    colorMapRange: [number, number];
}

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
        setInterval(updateTimeStepNo, 500);
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
        const colors = getColorMapColors(
            this.props.colorMapName,
            (this.context as DeckGLLayerContext).userData.colorTables
        );

        const layer = new PolygonLayer<PolygonData>(
            this.getSubLayerProps<PolygonData, PolygonLayerProps<PolygonData>>({
                data: makeLayerData(
                    data,
                    this.state.ti,
                    colors,
                    this.props.valueRange,
                    this.props.colorMapRange
                ),
                id: "grid-layer",
                getFillColor: (d: PolygonData) => d.properties.color,
                getLineColor: [0, 0, 0, 255],
                getLineWidth: 1,
                stroked: true,
                filled: true,
                lineWidthMinPixels: 1,
                visible: this.props.visible,
                coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            })
        );

        return [layer];
    }
}

GridLayer.layerName = "GridLayer";
GridLayer.defaultProps = layersDefaultProps[
    "GridLayer"
] as GridLayerProps<GridData>;

//================= Local help functions. ==================
function makeLayerData(
    data: GridData,
    ti: number,
    colors: RGBColor[],
    valueRange: [number, number],
    colorMapRange: [number, number]
): PolygonData[] {
    const polygons: PolygonData[] = data.map(function (
        cell: CellData
    ): PolygonData {
        const propertyValue = cell.vs[ti];

        const valueRangeMin = valueRange[0] ?? 0.0;
        const valueRangeMax = valueRange[1] ?? 1.0;

        // If specified color map will extend from colorMapRangeMin to colorMapRangeMax.
        // Otherwise it will extend from valueRangeMin to valueRangeMax.
        const colorMapRangeMin = colorMapRange?.[0] ?? valueRangeMin;
        const colorMapRangeMax = colorMapRange?.[1] ?? valueRangeMax;
        let x = propertyValue * (valueRangeMax - valueRangeMin) + valueRangeMin;
        x = (x - colorMapRangeMin) / (colorMapRangeMax - colorMapRangeMin);
        x = Math.max(0.0, x);
        x = Math.min(1.0, x);

        const color = colors[Math.floor(x * 255)];

        return {
            polygon: cell.cs, // 4 corners
            properties: {
                color,
                i: cell.i,
                j: cell.j,
                depth: cell.z,
                value: cell.vs[ti],
            },
        };
    });

    return polygons;
}
