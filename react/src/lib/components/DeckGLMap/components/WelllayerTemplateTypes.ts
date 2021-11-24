export interface propertiesObj {
    objectName: string;
    colorTable: string;
    context: string;
    colorInterpolation: string;
}

type propertiesArr = Array<propertiesObj>;

interface template {
    name: string;
    properties: propertiesArr;
}

export type templateArray = Array<template>;
