import PropTypes from "prop-types";

// see ../utils/pattern.tsx
export const PatternsType = PropTypes.array; /*Of<string, number>*/ // [string, number]

export const PatternsTableType = PropTypes.shape({
    patternSize: PropTypes.number.isRequired,
    patternImages: PropTypes.arrayOf(PropTypes.string).isRequired,
    patternNames: PropTypes.arrayOf(PropTypes.string),
});

// see ./ColorMapFunction.ts
export const ColorFunctionType = PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.object,
]);

// see ./WellLogTemplateTypes.ts
export const TemplatePlotScaleType = PropTypes.oneOf(["linear", "log"]);
export const TemplatePlotTypeType = PropTypes.oneOf([
    "",
    "line",
    "linestep",
    "dot",
    "area",
    "differential",
    "gradientfill",
    "stacked",
]);
export const CSSColorType = PropTypes.string;

// for ihheritance
const templatePlotPropsType = {
    type: TemplatePlotTypeType,
    scale: TemplatePlotScaleType,
    domain: PropTypes.arrayOf(PropTypes.number) /*[number, number]*/,

    color: CSSColorType,
    inverseColor: CSSColorType,

    fill: CSSColorType,
    fillOpacity: PropTypes.number,
    colorMapFunctionName: PropTypes.string,
    inverseColorMapFunctionName: PropTypes.string,
    colorScale: TemplatePlotScaleType,
    inverseColorScale: TemplatePlotScaleType,

    color2: CSSColorType,
    fill2: CSSColorType,

    showLabels: PropTypes.bool,
    showLines: PropTypes.bool,
    labelRotation: PropTypes.number,
    //...
}; // Part of JSON

export const TemplatePlotPropsType = PropTypes.shape(templatePlotPropsType);

export const TemplatePlotType = PropTypes.shape({
    ...templatePlotPropsType,
    name: PropTypes.string.isRequired,
    style: PropTypes.string,
    scale: TemplatePlotScaleType,
    name2: PropTypes.string,
});

export const TemplateStyleType = PropTypes.shape({
    ...templatePlotPropsType,
    name: PropTypes.string,
});

export const TemplateTrackType = PropTypes.shape({
    title: PropTypes.string,
    required: PropTypes.bool,
    width: PropTypes.number,
    plots: PropTypes.arrayOf(TemplatePlotType).isRequired,
    scale: TemplatePlotScaleType,
    domain: PropTypes.arrayOf(PropTypes.number) /*[number, number]*/,
});
export const TemplateType = PropTypes.shape({
    name: PropTypes.string.isRequired,
    scale: PropTypes.shape({
        primary: PropTypes.string.isRequired,
        allowSecondary: PropTypes.bool,
    }).isRequired,
    tracks: PropTypes.arrayOf(TemplateTrackType).isRequired,
    styles: PropTypes.arrayOf(TemplateStyleType),
    //...
});
