import React from "react";
import DeckGLMap from "../DeckGLMap";
import exampleData from "../../../demo/example-data/deckgl-map.json";
const drawing_layer = exampleData[0].layers.find(
    (item) => item["@@type"] === "DrawingLayer"
);
if(drawing_layer)
    drawing_layer.visible=false;

let welllogs = require("../../../demo/example-data/volve_logs.json");

//import AxisSelector from "./components/AxisSelector";
import InfoPanel from "./components/InfoPanel";
//import ZoomSlider from "./components/ZoomSlider";
import WellLogViewWithScroller from "./components/WellLogViewWithScroller";
import { axisTitles, axisMnemos } from "./utils/axes";
import { fillInfos } from "./utils/fill-info";

let template = {
    name: "Template LOG",
    scale: {
        primary: "tvd",
    },
    tracks: [
        {
            plots: [
                {
                    name: "ZONELOG",
                    style: "discrete",
                },
            ],
        },
    ],
    styles: [
        {
            name: "discrete",
            type: "stacked",
        },
    ],
};

export default {
    component: DeckGLMap,
    title: "WellLogViewer/Demo/MapAndWellLog",
    argTypes: {
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

        bounds: {
            description:
                "Coordinate boundary for the view defined as [left, bottom, right, top].",
        },

        zoom: {
            description: "Zoom level for the view",
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
                "https://github.com/emerson-eps/color-tables/blob/main/react-app/src/component/color-tables.json",
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
    },
};

// Template for when edited data needs to be captured.
const EditDataTemplate = (args) => {
    const [wellIndex, setWellIndex] = React.useState(-1);
    const [infos, setInfos] = React.useState();
    const [controller, setController] = React.useState();
    const [editedData, setEditedData] = React.useState(args.editedData);
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);

    const onInfo = function (x, logController, iFrom, iTo) {
        const infos = fillInfos(
            x,
            logController,
            iFrom,
            iTo
            //this.collapsedTrackIds,
            //this.props.readoutOptions
        );

        setInfos(infos);
    };

    const onCreateController = (controller) => {
        setController(controller);
    };
    const onContentSelection = () => {
        const baseDomain = controller.getContentBaseDomain();
        const domain = controller.getContentDomain();
        const selection = controller.getContentSelection();
        //console.log(selection);
    };
    const onMouseEvent = (event) => {
        if (event.type == "click")
            console.log(
                "type =",
                event.type,
                " x =",
                event.x,
                " y =",
                event.y,
                " wellname =",
                event.wellname,
                " md =",
                event.md,
                " tvd =",
                event.tvd
            );
        if (event.wellname !== undefined) {
            /*if (event.type == "click")*/ {
                let i = 0;
                for (let welllog of welllogs) {
                    if (welllog.header.well === event.wellname) {
                        setWellIndex(i); // set the state
                        break;
                    }
                    i++;
                }
            }
            if (event.md !== undefined) controller.selectContent([event.md]);
        }
    };

    return (
        <div style={{ height: "95vh", width: "100%", display: "flex" }}>
            <div style={{ height: "100%", width: "70%", position: "relative" }}>
                <div>
                    <DeckGLMap
                        {...args}
                        editedData={editedData}
                        setProps={(updatedProps) => {
                            setEditedData(updatedProps.editedData);
                        }}
                        onMouseEvent={onMouseEvent}
                    />
                </div>
            </div>
            <div
                style={{
                    height: "85%",
                    width: "30%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        flex: "1 1",
                        height: "90%",
                        minWidth: "25px",
                        width: "100%",
                    }}
                >
                    <WellLogViewWithScroller
                        welllog={welllogs[wellIndex]}
                        template={
                            //template
                            require("../../../demo/example-data/welllog_template_2.json")
                        }
                        colorTables={require("../../../demo/example-data/color-tables.json")}
                        maxVisibleTrackNum={1}
                        primaryAxis={"md"}
                        axisTitles={axisTitles}
                        axisMnemos={axisMnemos}
                        onInfo={onInfo}
                        onCreateController={onCreateController}
                        onContentSelection={onContentSelection}
                    ></WellLogViewWithScroller>
                </div>
                <div
                    style={{
                        flex: "0 0",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        width: "255px",
                        minWidth: "255px",
                        maxWidth: "255px",
                    }}
                >
                    {/*<AxisSelector
                        header="Primary scale"
                    />*/}
                    <InfoPanel header="Readout" infos={infos} />
                    {/*<div style={{ paddingLeft: "10px", display: "flex" }}>
                        <span>Zoom:</span>
                        <span
                            style={{
                                flex: "1 1 100px",
                                padding: "0 20px 0 10px",
                            }}
                        >
                        <ZoomSlider />
                        </span>
                    </div>*/}
                </div>
            </div>
        </div>
    );
};

export const Default = EditDataTemplate.bind({});    
Default.args = {
    ...exampleData[0],
};
