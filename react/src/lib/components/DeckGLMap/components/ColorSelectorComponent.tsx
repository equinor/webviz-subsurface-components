import * as React from "react";
import { LegendContinous } from "./legendContinous";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const colorTables = require("@emerson-eps/color-tables/src/component/color-tables.json");
import {colorScalesCont} from "./d3ColorScale"

const position = [16, 206];
const continuosColorData: any = []
const continuosD3ColorData: any = []

declare type legendProps = {
    useColorTableColors: boolean
    useD3Colors: boolean
    parentdata: any;
}

// code is for color table continuous data
var colorTableContinuousData = colorTables.filter((element: any) => {
    return element.discrete == false; 
});

colorTableContinuousData.forEach((element: any) => {
    continuosColorData.push({color: element.colors, name: element.name})
});

// code is for d3 continuous data
var d3continuousData = colorScalesCont.filter((element: any) => {
    return element.discrete == false; 
});

d3continuousData.forEach((element: any) => {
    continuosD3ColorData.push({color: element.colors, name: element.name})
});

export const ColorSelector: React.FC<legendProps> = ({
    useColorTableColors,
    parentdata,
    useD3Colors,
}: legendProps) => {
    let continuousLegend;

    //const [parent, setIsParent] = React.useState();
    // const parent_data = React.useCallback((parent_data: any) => {
    //     console.log('colorselectorcomponent---', parent_data)
    //     setIsParent(parent_data);
    // }, []);

    if (useColorTableColors) {
        continuousLegend =  continuosColorData.map((value: any, key: any) => {
            return <LegendContinous 
                        position={position + key} 
                        colorArray={value}
                        legendColor={''}
                        legendColorName={''} 
                        useContColorTable={true}
                        valueIndex={key}
                        parentFunc={parentdata.parentdata}
            />
        });
    } 
    if (useD3Colors) {
        continuousLegend = continuosD3ColorData.map((val: any, key: any) => {
            return <LegendContinous
                        position={position + key}
                        colorArray={{}}
                        legendColor={val.color} 
                        legendColorName={val.name} 
                        useContColorTable={false}  
                        valueIndex={key + "0"}
                        parentFunc={parentdata.parentdata}
            />
        });
    }

    return (
        <div>
            {continuousLegend} 
        </div>
    );
};