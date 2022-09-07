import React from "react";

import {Meta, Story} from "@storybook/react";

import { VectorCalculator } from "./VectorCalculator";
import {VectorCalculatorProps} from "../VectorCalculator/components/VectorCalculatorComponent";

import { v4 as uuidv4 } from "uuid";


export default {
    title: "VectorCalculator/VectorCalculator",
    component: VectorCalculator
} as Meta;

const Template: Story<VectorCalculatorProps> = (args)=>{
    return (
        <div style={{ height: "70vh", width: "90vw" }}>
            <VectorCalculator {...args}/>
        </div>
    );
};

export const Demo = Template.bind({});
Demo.args = {
    id: "VectorCalculator",
    setProps: () => {
        return;
    },
    maxExpressionDescriptionLength: 35,
    isDashControlled: false,
    vectors: [
        {
            name: "BPR",
            description: "Oil phase Pressure, block 15,28,1",
            children: [
                {
                    name: "15,28,1",
                },
                {
                    name: "15,28,10",
                },
                {
                    name: "15,28,13",
                },
                {
                    name: "1095",
                },
                {
                    name: "24135",
                },
                {
                    name: "31815",
                },
            ],
        },
        {
            name: "FGIR",
            description: "Gas Injection Rate",
            children: [],
        },
        {
            name: "FGIT",
            description: "Gas Injection Total",
            children: [],
        },
        {
            name: "FGPT",
            description: "Gas Production Total",
            children: [],
        },
        {
            name: "GGIR",
            description: "Gas Injection Rate, group OP",
            children: [
                {
                    name: "OP",
                },
                {
                    name: "WI",
                },
            ],
        },
        {
            name: "GGLR",
            description: "Gas-Liquid Ratio, group OP",
            children: [
                {
                    name: "OP",
                },
                {
                    name: "WI",
                },
            ],
        },
        {
            name: "GWGR",
            description: "Water-Gas Ratio, group OP",
            children: [
                {
                    name: "OP",
                },
                {
                    name: "WI",
                },
            ],
        },
        {
            name: "GWIR",
            description: "Water Injection Rate, group OP",
            children: [
                {
                    name: "OP",
                },
                {
                    name: "WI",
                },
            ],
        },
        {
            name: "GWPR",
            description: "Water Production Rate, group OP",
            children: [
                {
                    name: "OP",
                },
                {
                    name: "WI",
                },
            ],
        },
        {
            name: "GWPT",
            description: "Water Production Total, group OP",
            children: [
                {
                    name: "OP",
                },
                {
                    name: "WI",
                },
            ],
        },
        {
            name: "RGIP",
            description: "Gas In Place (liquid+gas phase), region 1",
            children: [
                {
                    name: "1",
                },
                {
                    name: "2",
                },
                {
                    name: "3",
                },
                {
                    name: "4",
                },
                {
                    name: "5",
                },
                {
                    name: "6",
                },
            ],
        },
        {
            name: "RGIPG",
            description: "Gas In Place (gas phase), region 1",
            children: [
                {
                    name: "1",
                },
                {
                    name: "2",
                },
                {
                    name: "3",
                },
                {
                    name: "4",
                },
                {
                    name: "5",
                },
                {
                    name: "6",
                },
            ],
        },
        {
            name: "RGIPL",
            description: "Gas In Place (liquid phase), region 1",
            children: [
                {
                    name: "1",
                },
                {
                    name: "2",
                },
                {
                    name: "3",
                },
                {
                    name: "4",
                },
                {
                    name: "5",
                },
                {
                    name: "6",
                },
            ],
        },
        {
            name: "RGPR",
            description: "Gas Production Rate, region 1",
            children: [
                {
                    name: "1",
                },
                {
                    name: "2",
                },
                {
                    name: "3",
                },
                {
                    name: "4",
                },
                {
                    name: "5",
                },
                {
                    name: "6",
                },
            ],
        },
        {
            name: "RGPT",
            description: "Gas Production Total, region 1",
            children: [
                {
                    name: "1",
                },
                {
                    name: "2",
                },
                {
                    name: "3",
                },
                {
                    name: "4",
                },
                {
                    name: "5",
                },
                {
                    name: "6",
                },
            ],
        },
        {
            name: "ROIP",
            description: "Oil In Place (liquid+gas phase), region 1",
            children: [
                {
                    name: "1",
                },
                {
                    name: "2",
                },
                {
                    name: "3",
                },
                {
                    name: "4",
                },
                {
                    name: "5",
                },
                {
                    name: "6",
                },
            ],
        },
        {
            name: "ROIPG",
            description: "Oil In Place (gas phase), region 1",
            children: [
                {
                    name: "1",
                },
                {
                    name: "2",
                },
                {
                    name: "3",
                },
                {
                    name: "4",
                },
                {
                    name: "5",
                },
                {
                    name: "6",
                },
            ],
        },
        {
            name: "TCPU",
            description: "TCPU",
            children: [],
        },
        {
            name: "TCPUDAY",
            description: "TCPUDAY",
            children: [],
        },
        {
            name: "WBHP",
            description: "Bottom Hole Pressure, well OP_1",
            children: [
                {
                    name: "OP_1",
                },
                {
                    name: "OP_2",
                },
                {
                    name: "OP_3",
                },
                {
                    name: "OP_4",
                },
                {
                    name: "OP_5",
                },
                {
                    name: "WI_1",
                },
                {
                    name: "WI_2",
                },
                {
                    name: "WI_3",
                },
            ],
        },
        {
            name: "WGIR",
            description: "Gas Injection Rate, well OP_1",
            children: [
                {
                    name: "OP_1",
                },
                {
                    name: "OP_2",
                },
                {
                    name: "OP_3",
                },
                {
                    name: "OP_4",
                },
                {
                    name: "OP_5",
                },
                {
                    name: "WI_1",
                },
                {
                    name: "WI_2",
                },
                {
                    name: "WI_3",
                },
            ],
        },
        {
            name: "WGOR",
            description: "Gas-Oil Ratio, well OP_1",
            children: [
                {
                    name: "OP_1",
                },
                {
                    name: "OP_2",
                },
                {
                    name: "OP_3",
                },
                {
                    name: "OP_4",
                },
                {
                    name: "OP_5",
                },
                {
                    name: "WI_1",
                },
                {
                    name: "WI_2",
                },
                {
                    name: "WI_3",
                },
            ],
        },
        {
            name: "WGPR",
            description: "Gas Production Rate, well OP_1",
            children: [
                {
                    name: "OP_1",
                },
                {
                    name: "OP_2",
                },
                {
                    name: "OP_3",
                },
                {
                    name: "OP_4",
                },
                {
                    name: "OP_5",
                },
                {
                    name: "WI_1",
                },
                {
                    name: "WI_2",
                },
                {
                    name: "WI_3",
                },
            ],
        },
        {
            name: "WGPT",
            description: "Gas Production Total, well OP_1",
            children: [
                {
                    name: "OP_1",
                },
                {
                    name: "OP_2",
                },
                {
                    name: "OP_3",
                },
                {
                    name: "OP_4",
                },
                {
                    name: "OP_5",
                },
                {
                    name: "WI_1",
                },
                {
                    name: "WI_2",
                },
                {
                    name: "WI_3",
                },
            ],
        },
        {
            name: "WOPT",
            description: "Oil Production Total, well OP_1",
            children: [
                {
                    name: "OP_1",
                },
                {
                    name: "OP_2",
                },
                {
                    name: "OP_3",
                },
                {
                    name: "OP_4",
                },
                {
                    name: "OP_5",
                },
                {
                    name: "WI_1",
                },
                {
                    name: "WI_2",
                },
                {
                    name: "WI_3",
                },
            ],
        },
        {
            name: "WWIT",
            description: "Water Injection Total, well OP_1",
            children: [
                {
                    name: "OP_1",
                },
                {
                    name: "OP_2",
                },
                {
                    name: "OP_3",
                },
                {
                    name: "OP_4",
                },
                {
                    name: "OP_5",
                },
                {
                    name: "WI_1",
                },
                {
                    name: "WI_2",
                },
                {
                    name: "WI_3",
                },
            ],
        },
        {
            name: "WWPR",
            description: "Water Production Rate, well OP_1",
            children: [
                {
                    name: "OP_1",
                },
                {
                    name: "OP_2",
                },
                {
                    name: "OP_3",
                },
                {
                    name: "OP_4",
                },
                {
                    name: "OP_5",
                },
                {
                    name: "WI_1",
                },
                {
                    name: "WI_2",
                },
                {
                    name: "WI_3",
                },
            ],
        },
        {
            name: "YEARS",
            description: "Years",
            children: [],
        },
    ],
    expressions: [
        {
            name: "Test",
            expression: "x+y",
            id: uuidv4(),
            variableVectorMap: [
                { variableName: "x", vectorName: ["WOPT:OP_1"] },
                { variableName: "y", vectorName: ["FGIR"] },
            ],
            description: "First expression description text",
            isValid: true,
            isDeletable: false,
        },
        {
            name: "Test2",
            expression: "x-y",
            id: uuidv4(),
            variableVectorMap: [
                { variableName: "x", vectorName: ["WOPT:OP_3"] },
                { variableName: "y", vectorName: ["FGIR"] },
            ],
            description: "Second expression description text is too long",
            isValid: true,
            isDeletable: false,
        },
        {
            name: "Test3",
            expression: "x-2*y",
            id: uuidv4(),
            variableVectorMap: [
                { variableName: "x", vectorName: ["WOPT:OP_1"] },
                { variableName: "y", vectorName: ["WWPR:OP_3"] },
            ],
            isValid: true,
            isDeletable: false,
        },
        {
            name: "Test4",
            expression: "x-2*y/z",
            id: uuidv4(),
            variableVectorMap: [
                { variableName: "x", vectorName: ["WWPR:OP_2"] },
                { variableName: "y", vectorName: ["FGIR"] },
                { variableName: "z", vectorName: ["WBHP:OP_2"] },
            ],
            isValid: true,
            isDeletable: false,
        },
    ],
}
