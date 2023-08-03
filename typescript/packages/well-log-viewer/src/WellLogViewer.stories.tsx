/* eslint-disable react-hooks/exhaustive-deps */ // remove when ready to fix these.

import React from "react";
import WellLogViewer from "./WellLogViewer";
import { argTypesWellLogViewerProp } from "./WellLogViewer";
//import { colorTables } from "@emerson-eps/color-tables";

import exampleData from "../../../../example-data/deckgl-map.json";

import PropTypes from "prop-types";

import { WeakValidationMap } from "react";
import SubsurfaceViewer from "@webviz/subsurface-viewer";
import { SubsurfaceViewerProps } from "@webviz/subsurface-viewer";
import { Color, LayersList } from "@deck.gl/core/typed";

import { WellsLayer } from "@webviz/subsurface-viewer/dist/layers";
import {
    Template,
    TemplateTrack,
    TemplatePlot,
    TemplatePlotTypes,
} from "./components/WellLogTemplateTypes";

import { WellLog } from "./components/WellLogTypes";
import welllogsJson from "./demo/example-data/volve_logs.json";
const welllogs = welllogsJson as unknown as WellLog[];

import templateJson from "./demo/example-data/welllog_template_2.json";
const template = templateJson as unknown as Template;

import { ColorTable } from "./components/ColorTableTypes";

import { WellLogController } from "./components/WellLogView";
import { LogViewer } from "@equinor/videx-wellog";
import { Info } from "./components/InfoTypes";
import { MapMouseEvent } from "@webviz/subsurface-viewer/dist/components/Map";

import InfoPanel from "./components/InfoPanel";
import WellLogViewWithScroller from "./components/WellLogViewWithScroller";
import { fillInfos } from "./utils/fill-info";
import { getDiscreteMeta, indexOfElementByName } from "./utils/tracks";
import { deepCopy } from "./utils/deepcopy";

import { WellLogViewOptions } from "./components/WellLogView";
import { isEqualRanges } from "./components/WellLogView";

import wellPicks from "./demo/example-data/wellpicks.json";
import colorTables from "./demo/example-data/wellpick_colors.json";

import { axisTitles, axisMnemos } from "./utils/axes";

const ComponentCode =
    '<WellLogViewer id="WellLogViewer" \r\n' +
    "    horizontal=false \r\n" +
    '    welllog={require("../../../../example-data/L898MUD.json")[0]} \r\n' +
    '    template={require("../../../../example-data/welllog_template_1.json")} \r\n' +
    "    colorTables={colorTables} \r\n" +
    "/>";

export default {
    component: WellLogViewer,
    title: "WellLogViewer/Demo/WellLogViewer",
    parameters: {
        docs: {
            description: {
                component:
                    "A demo component to deal with WellLogView component.",
            },
        },
        componentSource: {
            code: ComponentCode,
            language: "javascript",
        },
    },
    argTypes: {
        ...argTypesWellLogViewerProp,
        id: {
            description:
                "The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app.",
        },
    },
};

function fillInfo(controller) {
    if (!controller) return "-";
    const baseDomain = controller.getContentBaseDomain();
    const domain = controller.getContentDomain();
    const selection = controller.getContentSelection();
    return (
        "total: [" +
        baseDomain[0].toFixed(0) +
        ", " +
        baseDomain[1].toFixed(0) +
        "], " +
        "visible: [" +
        domain[0].toFixed(0) +
        ", " +
        domain[1].toFixed(0) +
        "]" +
        (selection[0] !== undefined
            ? ", selected: [" +
              selection[0].toFixed(0) +
              (selection[1] !== undefined
                  ? ", " + selection[1].toFixed(0)
                  : "") +
              "]"
            : "")
    );
}

const StoryTemplate = (args) => {
    const infoRef = React.useRef();
    const setInfo = function (info) {
        if (infoRef.current) infoRef.current.innerHTML = info;
    };
    const [controller, setController] = React.useState(null);
    const onCreateController = React.useCallback(
        (controller) => {
            setController(controller);
        },
        [controller]
    );
    const onContentRescale = React.useCallback(() => {
        setInfo(fillInfo(controller));
    }, [controller]);
    const onContentSelection = React.useCallback(() => {
        setInfo(fillInfo(controller));
    }, [controller]);

    return (
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ width: "100%", height: "100%", flex: 1 }}>
                <WellLogViewer
                    id="WellLogViewer"
                    {...args}
                    onCreateController={onCreateController}
                    onContentRescale={onContentRescale}
                    onContentSelection={onContentSelection}
                />
            </div>
            <div ref={infoRef} style={{ width: "100%", flex: 0 }}></div>
        </div>
    );
};

const wellpick = {
    wellpick: wellPicks[0],
    name: "HORIZON",
    colorTables: colorTables,
    color: "Stratigraphy",
};



function getTemplatePlotColorTable(
    template: Template,
    templatePlot: TemplatePlot
) {
    let colorTable = templatePlot.colorTable;
    if (!colorTable && templatePlot.style) {
        const templateStyles = template.styles;
        if (templateStyles) {
            const iStyle = indexOfElementByName(
                templateStyles,
                templatePlot.style
            );
            if (iStyle >= 0) {
                const style = templateStyles[iStyle];
                colorTable = style.colorTable;
            }
        }
    }
    return colorTable;
}

interface Props extends SubsurfaceViewerProps {
    /**
     * Options for well log view
     */
    welllogOptions?: WellLogViewOptions;
}

interface State {
    wellIndex: number | undefined;
    infos: Info[];
    controller?: WellLogController;
    editedData?: Record<string, unknown>;

    layers?: LayersList;

    wellName?: string;
    selection?: [number | undefined, number | undefined];
    selPersistent?: boolean;
    wellColor?: Color; // well color
}

function findWellsLayer(event: MapMouseEvent) {
    const info = event.infos.find((info) => info.layer?.id === "wells-layer");
    return info?.layer as WellsLayer;
}

function findWellLogIndex(welllogs: WellLog[], wellName: string): number {
    return welllogs.findIndex((welllog) => welllog.header.well === wellName);
}

function findLog(template: Template, logName: string): number {
    return template.tracks.findIndex(
        (track) => track.plots[0]?.name === logName
    );
}

function detectType(welllog: WellLog, logName: string): TemplatePlotTypes {
    if (welllog) {
        const meta = getDiscreteMeta(welllog, logName); // non-standard extention of WellLog JSON file
        if (meta) return "stacked";
    }
    return "line";
}

function addTemplateTrack(
    template: Template,
    welllog: WellLog,
    logName: string
): Template {
    // add missed TemplateTrack for the given logName
    const type: TemplatePlotTypes = detectType(welllog, logName);
    const templateNew = deepCopy(template);
    const templateTrack: TemplateTrack = {
        title: logName,
        required: true, // force to show on all wells
        plots: [{ name: logName, type: type, color: "red" }],
    };
    templateNew.tracks.push(templateTrack);
    return templateNew;
}

export const Default = StoryTemplate.bind({});
Default.args = {
    id: "Well-Log-Viewer",
    horizontal: false,
    welllog: require("../../../../example-data/L898MUD.json")[0],
    template: require("../../../../example-data/welllog_template_1.json"),
    colorTables: colorTables,
    wellpick: wellpick,
    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
    viewTitle: true, // show default welllog view title (a wellname from the welllog)
    options: {
        hideTrackTitle: false,
        hideTrackLegend: false,
    },
};

export const Horizontal = StoryTemplate.bind({});
Horizontal.args = {
    id: "Well-Log-Viewer-Horizontal",
    horizontal: true,
    welllog:
        require("../../../../example-data/WL_RAW_AAC-BHPR-CAL-DEN-GR-MECH-NEU-NMR-REMP_MWD_3.json")[0],
    template: require("../../../../example-data/welllog_template_2.json"),
    colorTables: colorTables,
    wellpick: wellpick,
    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
    viewTitle: true, // show default welllog view title (a wellname from the welllog)
};
Horizontal.parameters = {
    docs: {
        description: {
            story: "An example showing horizontal orientation of the tracks.",
        },
    },
};

export class MapAndWellLogViewer extends React.Component<Props, State> {
    public static propTypes?: WeakValidationMap<Props> | undefined;
    constructor(props: Props, state: State) {
        super(props, state);
        this.state = {
            wellIndex: undefined,
            infos: [],
            editedData: props.editedData,
            layers: props.layers as LayersList,
        };
        this.onInfo = this.onInfo.bind(this);
        this.onCreateController = this.onCreateController.bind(this);
        this.onContentSelection = this.onContentSelection.bind(this);
        this.onTrackScroll = this.onTrackScroll.bind(this);

        this.onMouseEvent = this.onMouseEvent.bind(this);
    }
    componentDidUpdate(prevProps: Props, prevState: State): void {
        if (this.props.editedData !== prevProps.editedData) {
            this.setState({ editedData: this.props.editedData });
            0;
        }
        if (!isEqualRanges(this.state.selection, prevState.selection)) {
            const controller = this.state.controller;
            if (controller && this.state.selection) {
                controller.selectContent([
                    this.state.selection[0],
                    this.state.selection[1],
                ]);
            }
        }
    }
    onInfo(
        x: number,
        logController: LogViewer,
        iFrom: number,
        iTo: number
    ): void {
        const infos = fillInfos(
            x,
            logController,
            iFrom,
            iTo,
            [] //this.collapsedTrackIds,
            //this.props.readoutOptions
        );

        this.setState({ infos: infos });
    }

    onCreateController(controller: WellLogController): void {
        this.setState({ controller: controller });
    }
    onContentSelection(): void {
        const controller = this.state.controller;
        if (!controller) return;
        const selection = controller.getContentSelection();

        // synchronize selection only from the current well
        /*if (?? === this.state.wellName)*/ {
            this.setState({
                selection: selection,
                selPersistent: selection[1] !== undefined,
            });
        }
    }
    onTrackScroll(): void {
        const controller = this.state.controller;
        if (!controller) return;
        const iTrack = controller.getTrackScrollPos();
        if (iTrack >= 0) {
            const template = controller.getTemplate();
            const track = template.tracks[iTrack];
            if (track) {
                const templatePlot = track.plots[0];
                if (templatePlot) {
                    const wells_layer = (
                        this.props.layers as Record<string, unknown>[]
                    )?.find(
                        (item: Record<string, unknown>) =>
                            item["@@type"] === "WellsLayer"
                    );
                    if (
                        wells_layer &&
                        wells_layer["logName"] !== templatePlot.name
                    ) {
                        wells_layer["logName"] = templatePlot.name;
                        const colorTable = getTemplatePlotColorTable(
                            template,
                            templatePlot
                        );
                        if (colorTable) wells_layer["logColor"] = colorTable;

                        const layers = deepCopy(this.props.layers);
                        this.setState({
                            layers: layers as LayersList,
                        });

                        // Force to rerender ColorLegend after
                        setTimeout(() => {
                            const layers = deepCopy(this.props.layers);
                            this.setState({
                                layers: layers as LayersList,
                            });
                        }, 200);
                    }
                }
            }
        }
    }

    onMouseEvent(event: MapMouseEvent): void {
        if (event.wellname !== undefined) {
            if (event.type == "click") {
                const iWell = findWellLogIndex(welllogs, event.wellname);
                this.setState((state: Readonly<State>) => {
                    //if (state.wellIndex === iWell) return null;

                    let selection:
                        | [number | undefined, number | undefined]
                        | undefined = undefined;
                    let selPersistent: boolean | undefined = undefined;
                    if (
                        state.wellIndex !== iWell ||
                        !state.selection ||
                        state.selPersistent
                    ) {
                        selection = [event.md, undefined];
                        selPersistent = false;
                    } else {
                        if (state.selection[1] !== undefined) {
                            // have something pinned
                            selection = [event.md, state.selection[1]];
                            selPersistent = true;
                        } else {
                            // no pinned yet
                            selection = [event.md, state.selection[0]]; // copy current to pinned
                            selPersistent = false;
                        }
                    }

                    return {
                        wellIndex: iWell,
                        wellName: event.wellname,
                        wellColor: event.wellcolor,
                        selection: selection,
                        selPersistent: selPersistent,
                    };
                });

                const controller = this.state.controller;
                if (controller) {
                    const wellsLayer = findWellsLayer(event);
                    if (wellsLayer) {
                        const template = controller.getTemplate();
                        const logName = wellsLayer.props?.logName;
                        let iTrack = findLog(template, logName);
                        if (iTrack < 0) {
                            //const welllog = info.object is Feature or WellLog;
                            const welllog = welllogs[iWell];
                            const templateNew = addTemplateTrack(
                                template,
                                welllog,
                                logName
                            );
                            controller.setTemplate(templateNew);

                            iTrack = findLog(template, logName);
                        }
                        controller.scrollTrackTo(iTrack);
                    }
                }
            }
            if (event.wellname === this.state.wellName) {
                // synchronize selection only from the current well
                if (event.md !== undefined) {
                    this.setState((state: Readonly<State>) => {
                        if (state.selPersistent) return null;
                        if (event.md === state.selection?.[0]) return null;

                        return {
                            selection: [event.md, state.selection?.[1]],
                        };
                    });

                    //if (wellsLayer)
                    //    wellsLayer.setSelection(event.wellname, [event.md, undefined]);
                }
            }
        }
    }

    render(): JSX.Element {
        const wellName = this.state.wellName;
        const wellColor = this.state.wellColor;
        const wellIndex = this.state.wellIndex;
        const viewTitle = (
            <div style={{ fontSize: "16px" }}>
                {wellColor && (
                    <span
                        style={{
                            color: wellColor
                                ? "rgb(" +
                                  wellColor[0] +
                                  "," +
                                  wellColor[1] +
                                  "," +
                                  wellColor[2] +
                                  ")"
                                : undefined,
                            fontSize: "small",
                        }}
                    >
                        {"\u2B24 " /*big circle*/}
                    </span>
                )}
                {wellName || "Select a well by clicking on the map"}
                {wellIndex === -1 && (
                    <div className="welllogview-error">
                        No well logs found for the well
                    </div>
                )}
            </div>
        );

        return (
            <div style={{ height: "100%", width: "100%", display: "flex" }}>
                <div
                    style={{
                        height: "100%",
                        width: "70%",
                        position: "relative",
                    }}
                >
                    <div>
                        <SubsurfaceViewer
                            {...this.props}
                            layers={this.state.layers}
                            editedData={this.state.editedData}
                            onMouseEvent={this.onMouseEvent}
                            selection={{
                                well: wellName,
                                selection: this.state.selection,
                            }}
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
                            welllog={
                                wellIndex !== undefined
                                    ? welllogs[wellIndex]
                                    : undefined
                            }
                            template={template}
                            colorTables={this.props.colorTables as ColorTable[]}
                            // @aspentech: This issue needs to get sorted out, there seems to be a compatibility issue with the JSON file and the prop type
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            wellpick={wellpick}
                            primaryAxis={"md"}
                            axisTitles={axisTitles}
                            axisMnemos={axisMnemos}
                            viewTitle={viewTitle}
                            options={{
                                checkDatafileSchema:
                                    this.props.checkDatafileSchema,
                                maxVisibleTrackNum: 1,
                            }}
                            onInfo={this.onInfo}
                            onCreateController={this.onCreateController}
                            onContentSelection={this.onContentSelection}
                            onTrackScroll={this.onTrackScroll}
                        />
                    </div>
                    <div
                        style={{
                            flex: "0 0",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            width: "100%",
                        }}
                    >
                        <InfoPanel header="Readout" infos={this.state.infos} />
                    </div>
                </div>
            </div>
        );
    }
}

//const WellLogViewOptions_propTypes = PropTypes.shape({
//    /**
//     * The maximum zoom value
//     */
//    maxContentZoom: PropTypes.number,
//    /**
//     * The maximum number of visible tracks
//     */
//    maxVisibleTrackNum: PropTypes.number,
//    /**
//     * Validate JSON datafile against schema
//     */
//    checkDatafileSchema: PropTypes.bool,
//    /**
//     * Hide titles of the track. Default is false
//     */
//    hideTrackTitle: PropTypes.bool,
//    /**
//     * Hide legends of the track. Default is false
//     */
//    hideTrackLegend: PropTypes.bool,
//});
//
//MapAndWellLogViewer.propTypes = {
//    ...SubsurfaceViewer.propTypes,
//
//    /**
//     * WellLogView additional options
//     */
//    // eslint-disable-next-line @typescript-eslint/no-explicit-any
//    welllogOptions: WellLogViewOptions_propTypes as any /*PropTypes.object,*/,
//};

const drawing_layer = exampleData[0].layers.find(
    (item) => item["@@type"] === "DrawingLayer"
);
if (drawing_layer) drawing_layer.visible = false;

const wells_layer = exampleData[0].layers.find(
    (item) => item["@@type"] === "WellsLayer"
);
if (wells_layer) {
    /*
    "logData": "@@#resources.logData",
    "logrunName": "BLOCKING",
    "logName": "ZONELOG",
    "logColor": "Stratigraphy"
    */
    wells_layer.logName = "ZONE_MAIN"; //
    wells_layer.logColor = "Stratigraphy"; //"Stratigraphy";
}

/*
export {
    component: MapAndWellLogViewer,
    title: "WellLogViewer/Demo/MapAndWellLogViewer",
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

        welllogOptions: {
            description:
                "Options for well log view:<br/>" +
                "maxContentZoom: The maximum zoom value (default 256)<br/>" +
                "maxVisibleTrackNum: The maximum number of visible tracks<br/>" +
                "checkDatafileSchema: Validate JSON datafile against schema<br/>" +
                "hideTrackTitle: Hide titles on the tracks<br/>" +
                "hideLegend: Hide legends on the tracks.",
        },
        }
    }
};
*/

export const Discrete = StoryTemplate.bind({});
Discrete.args = {
    id: "Well-Log-Viewer-Discrete",
    horizontal: false,
    welllog: require("../../../../example-data/volve_logs.json")[0],
    template: require("../../../../example-data/welllog_template_2.json"),
    colorTables: colorTables,
    wellpick: wellpick,
    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
    viewTitle: true, // show default welllog view title (a wellname from the welllog)
};
Discrete.parameters = {
    docs: {
        description: {
            story: "An example showing the tracks with discrete logs.",
        },
    },
};

export const MapAndWellLogViewerStory = (
    args: React.JSX.IntrinsicAttributes &
        React.JSX.IntrinsicClassAttributes<MapAndWellLogViewer> &
        Readonly<Props>
) => {
    return (
        <div style={{ height: "94vh", width: "100%", display: "flex" }}>
            <MapAndWellLogViewer {...args} />
        </div>
    );
};

MapAndWellLogViewerStory.args = {
    ...exampleData[0],
    colorTables: colorTables,
    id: "MapAndWellLog", // redefine id from exampleData[0]
};
