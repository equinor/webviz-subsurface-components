export const argTypes = {
    id: {
        description:
            "The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app.",
    },

    resources: {
        description:
            "Resource dictionary made available in the DeckGL specification as an enum. \
      The values can be accessed like this: `@@#resources.resourceId`, where \
      `resourceId` is the key in the `resources` dict. For more information, \
      see the DeckGL documentation on enums in the json spec: \
      https://deck.gl/docs/api-reference/json/conversion-reference#enumerations-and-using-the--prefix",
    },

    layers: {
        description:
            "List of JSON object containing layer specific data. \
      Each JSON object will consist of layer type with key as `@@type` and layer specific data, if any.",
    },

    cameraPosition: {
        description: "Camera position to set the point of view.",
    },

    bounds: {
        description:
            "Coordinate boundary for the view defined as [left, bottom, right, top].",
    },

    triggerHome: {
        description: "Forces resetting to initial home position.",
    },

    views: {
        description:
            "Views configuration for map. If not specified, all the layers will be displayed in a single 2D viewport.<br/>" +
            "Options:<br/>" +
            "layout: [number, number] — Layout for viewport in specified as [row, column],<br/>" +
            "viewports: [`ViewportType`] — Layers configuration for multiple viewport,<br/><br/>" +
            "`ViewportType` options: <br/>" +
            "id: string — Viewport id <br>" +
            "name: string — Viewport name <br>" +
            "show3D: boolean — Toggle 3D view <br>" +
            "layerIds: [string] — Layer ids to be displayed on viewport.",
    },

    coords: {
        description:
            "Options for readout panel.<br/>" +
            "visible: boolean — Show/hide readout,<br/>" +
            "multipicking: boolean — Enable or disable multi picking,<br/>" +
            "pickDepth: number — Number of objects to pick.",
    },

    scale: {
        description:
            "Options for distance scale component.<br/>" +
            "visible: boolean — Show/hide scale bar,<br/>" +
            "incrementValue: number — Increment value for the scale,<br/>" +
            "widthPerUnit: number — Scale bar width in pixels per unit value,<br/>" +
            "position: [number, number] — Scale bar position in pixels.",
    },

    coordinateUnit: {
        description: "Unit for the scale ruler",
    },

    legend: {
        description:
            "Options for color legend.<br/>" +
            "visible: boolean — Show/hide color legend,<br/>" +
            "position: [number, number] — Legend position in pixels,<br/>" +
            "horizontal: boolean — Orientation of color legend.",
    },

    colorTables: {
        description:
            "Prop containing color table data." +
            "See colorTables repo for reference:<br/>" +
            "https://github.com/emerson-eps/color-tables/blob/main/react-app/dist/component/color-tables.json",
    },

    editedData: {
        description:
            "Map data returned via editedData prop.<br/>" +
            "selectedWell: string — Selected well name,<br/>" +
            "selectedPie: object — Selected pie chart data,<br/>" +
            "selectedFeatureIndexes: [number] — Drawing layer data index,<br/>" +
            "data: object — Drawing layer data, indexed from selectedFeatureIndexes.",
    },

    setProps: {
        description: "For reacting to prop changes",
    },
};
