import * as React from "react";
const colorTables = require("@emerson-eps/color-tables/src/component/color-tables.json");
//const colorTables = require("../../../../demo/example-data/color-tables.json");
import { d3ColorScales } from "@emerson-eps/color-tables/src/component/Utils/d3ColorScale";
import { ColorSelectorComponent } from "./ColorSelectorComponent";

const position = [16, 206];
const continuosColorData: any = [];
const continuosD3ColorData: any = [];
const discreteColorData: any = [];
const discreteD3ColorData: any = [];

declare type legendProps = {
    useColorTableColors: boolean;
    useD3Colors: boolean;
    colorScaleObject: any;
};

// Continuous legend using color table  data
const colorTableContinuousData = colorTables.filter((element: any) => {
    return element.discrete == false;
});

colorTableContinuousData.forEach((element: any) => {
    continuosColorData.push({ color: element.colors, name: element.name });
});

// Continuous legend using d3 data
const d3continuousData = d3ColorScales.filter((element: any) => {
    return element.discrete == false;
});

d3continuousData.forEach((element: any) => {
    continuosD3ColorData.push({ color: element.colors, name: element.name });
});

// Discrete legend using color table data
const discreteData = colorTables.filter((element: any) => {
    return element.discrete == true;
});

discreteData.forEach((element: any) => {
    discreteColorData.push({ color: element.colors, name: element.name });
});

// Discrete legend using d3 data
const d3discreteData = d3ColorScales.filter((element: any) => {
    return element.discrete == true;
});

d3discreteData.forEach((element: any) => {
    discreteD3ColorData.push({ color: element.colors, name: element.name });
});

export const ColorSelectorWrapper: React.FC<legendProps> = ({
    useColorTableColors,
    useD3Colors,
    colorScaleObject,
}: legendProps) => {
    let continuousLegend;
    let discreteLegend;

    // return continuous and discrete legend which uses colortable data
    if (useColorTableColors) {
        continuousLegend = continuosColorData.map((value: any, key: any) => {
            return (
                <div>
                    <ColorSelectorComponent
                        position={position + key}
                        colorsObject={value}
                        useContColorTable={true}
                        valueIndex={key}
                        colorScaleData={colorScaleObject.colorScaleObject}
                    />
                </div>
            );
        });

        discreteLegend = discreteColorData.map((val: any, key: any) => {
            return (
                <ColorSelectorComponent
                    position={position + key}
                    colorsObject={discreteColorData[key]}
                    legendColorName={val.name}
                    useDiscColorTable={true}
                    colorScaleData={colorScaleObject.colorScaleObject}
                />
            );
        });
    }
    // return continuous and discrete legend which uses d3 data
    if (useD3Colors) {
        continuousLegend = continuosD3ColorData.map((val: any, key: any) => {
            return (
                <ColorSelectorComponent
                    position={position + key}
                    legendColor={val.color}
                    legendColorName={val.name}
                    useContColorTable={false}
                    valueIndex={key + "0"}
                    colorScaleData={colorScaleObject.colorScaleObject}
                />
            );
        });

        discreteLegend = d3discreteData.map((val: any, key: any) => {
            return (
                <ColorSelectorComponent
                    position={position + key}
                    colorsObject={val.colors}
                    legendColorName={val.name}
                    useDiscColorTable={false}
                    colorScaleData={colorScaleObject.colorScaleObject}
                />
            );
        });
    }

    return (
        <div
            className="legendWrapper"
            style={{
                height: 200,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                overflowX: "hidden",
            }}
        >
            {continuousLegend}
            {discreteLegend}
        </div>
    );
};
