import React from "react";
import SyncLogViewer from "./SyncLogViewer";
import { argTypesSyncLogViewerProp } from "./SyncLogViewer";
import { colorTables } from "@emerson-eps/color-tables";

const ComponentCode =
    '<SyncLogViewer id="SyncLogViewer" \r\n' +
    "    syncTrackPos==true \r\n" +
    "    syncContentDomain=true \r\n" +
    "    syncContentSelection=true \r\n" +
    "    syncTemplate=true \r\n" +
    "    horizontal=false \r\n" +
    "    welllog={[ \r\n" +
    '       require("../../../demo/example-data/L898MUD.json")[0], \r\n' +
    '       require("../../../demo/example-data/L916MUD.json")[0], \r\n' +
    "    ]} \r\n" +
    "    template={[ \r\n" +
    '       require("../../../demo/example-data/synclog_template.json"), \r\n' +
    '       require("../../../demo/example-data/synclog_template.json"), \r\n' +
    "    } \r\n" +
    "    colorTables={colorTables} \r\n" +
    "/>";

import { axisTitles, axisMnemos } from "./utils/axes";

export default {
    component: SyncLogViewer,
    title: "WellLogViewer/Demo/SyncLogViewer",
    parameters: {
        docs: {
            description: {
                component: "An example for linked WellLogView components",
            },
        },
        componentSource: {
            code: ComponentCode,
            language: "javascript",
        },
    },
    argTypes: {
        ...argTypesSyncLogViewerProp,
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

const Template = (args) => {
    const infoRef = React.useRef();
    const setInfo = function (info) {
        if (infoRef.current) infoRef.current.innerHTML = info;
    };
    const [controller, setController] = React.useState(null); // the first WellLog
    const onCreateController = React.useCallback(
        (iView, controller) => {
            if (iView === 0) setController(controller);
        },
        [controller]
    );
    const onContentRescale = React.useCallback(
        (iView) => {
            if (iView === 0) setInfo(fillInfo(controller));
        },
        [controller]
    );
    const onContentSelection = React.useCallback(
        (/*_iView*/) => {
            /*if(iView===0)*/ setInfo(fillInfo(controller));
        },
        [controller]
    );

    return (
        <div
            style={{ height: "92vh", display: "flex", flexDirection: "column" }}
        >
            <div style={{ width: "100%", height: "100%", flex: 1 }}>
                <SyncLogViewer
                    id="SyncLogViewer"
                    {...args}
                    onCreateController={onCreateController}
                    onContentRescale={onContentRescale}
                    onContentSelection={onContentSelection}
                />
            </div>
            {/* Print info for the first WellLog */}
            <div ref={infoRef} style={{ width: "100%", flex: 0 }}></div>
        </div>
    );
};

const patterns = [
    require("../../../demo/example-data/patterns/anhydrite.png"),
    require("../../../demo/example-data/patterns/brown_coal.png"),
    require("../../../demo/example-data/patterns/calcareous_dolostone.png"),
    require("../../../demo/example-data/patterns/chalk.png"),
    require("../../../demo/example-data/patterns/claystone.png"),
    require("../../../demo/example-data/patterns/conglomerate.png"),
    require("../../../demo/example-data/patterns/Diagonal.png"),
    require("../../../demo/example-data/patterns/Diagonalx2.png"),
    require("../../../demo/example-data/patterns/Diagonalx2_right.png"),
    require("../../../demo/example-data/patterns/Diagonalx4.png"),
    require("../../../demo/example-data/patterns/Diagonalx4_right.png"),
    require("../../../demo/example-data/patterns/dolomitic_limestone.png"),
    require("../../../demo/example-data/patterns/dolostone.png"),
    require("../../../demo/example-data/patterns/fissile_mudstone.png"),
    require("../../../demo/example-data/patterns/fissile_siltstone.png"),
    require("../../../demo/example-data/patterns/gypsum.png"),
    require("../../../demo/example-data/patterns/gypsum_anhydrite_unspecified.png"),
    require("../../../demo/example-data/patterns/halite.png"),
    require("../../../demo/example-data/patterns/Horizontal_lines.png"),
    require("../../../demo/example-data/patterns/Horizontal_linesx2.png"),
    require("../../../demo/example-data/patterns/Horizontal_vertical_lines.png"),
    require("../../../demo/example-data/patterns/Horizontal_vertical_linesx2.png"),
    require("../../../demo/example-data/patterns/Horizontal_vertical_linesx4.png"),
    require("../../../demo/example-data/patterns/limestone.png"),
    require("../../../demo/example-data/patterns/marl.png"),
    require("../../../demo/example-data/patterns/mudstone.png"),
    require("../../../demo/example-data/patterns/salt_general.png"),
    require("../../../demo/example-data/patterns/sandstone.png"),
    require("../../../demo/example-data/patterns/sedimentary_breccia.png"),
    require("../../../demo/example-data/patterns/shale.png"),
    require("../../../demo/example-data/patterns/silicic_plutonic_rocks.png"),
    require("../../../demo/example-data/patterns/siltstone.png"),
    require("../../../demo/example-data/patterns/Vertical_lines.png"),
    require("../../../demo/example-data/patterns/Vertical_linesx2.png"),
    require("../../../demo/example-data/patterns/vulcanic_rock_general.png"),
];
const patternNames = [
    "Anhydrite",
    "Brown coal",
    "Calcareous dolostone",
    "Chalk",
    "Claystone",
    "Conglomerate",
    "Diagonal",
    "Diagonalx2",
    "Diagonalx2 right",
    "Diagonalx4",
    "Diagonalx4 right",
    "Dolomitic limestone",
    "Dolostone",
    "Fissile mudstone",
    "Fissile siltstone",
    "Gypsum",
    "Gypsum anhydrite unspecified",
    "Halite",
    "Horizontal lines",
    "Horizontal linesx2",
    "Horizontal vertical lines",
    "Horizontal vertical linesx2",
    "Horizontal vertical linesx4",
    "Limestone",
    "Marl",
    "Mudstone",
    "Salt general",
    "Sandstone",
    "Sedimentary breccia",
    "Shale",
    "Silicic plutonic rocks",
    "Siltstone",
    "Vertical lines",
    "Vertical linesx2",
    "vulcanic rock general",
];

export const Default = Template.bind({});
Default.args = {
    id: "Sync-Log-Viewer",
    syncTrackPos: true,
    syncContentDomain: true,
    syncContentSelection: true,
    syncTemplate: true,
    horizontal: false,

    hideTitles: false,
    hideLegend: false,
    welllogs: [
        require("../../../demo/example-data/L898MUD.json")[0],
        require("../../../demo/example-data/L916MUD.json")[0],
        require("../../../demo/example-data/Lis1.json")[0],
    ],
    templates: [
        require("../../../demo/example-data/synclog_template.json"),
        require("../../../demo/example-data/synclog_template.json"),
    ],
    colorTables: colorTables,
    wellpicks: [
        {
            wellpick: require("../../../demo/example-data/wellpicks.json")[0],
            name: "HORIZON",
            colorTables: require("../../../demo/example-data/wellpick_colors.json"),
            color: "Stratigraphy",
        },
        {
            wellpick: require("../../../demo/example-data/wellpicks.json")[1],
            name: "HORIZON",
            colorTables: require("../../../demo/example-data/wellpick_colors.json"),
            color: "Stratigraphy",
        },
        {
            wellpick: require("../../../demo/example-data/wellpicks.json")[0],
            name: "HORIZON",
            colorTables: require("../../../demo/example-data/wellpick_colors.json"),
            color: "Stratigraphy",
        },
    ],
    patternsTable: {
        patternSize: 24,
        patterns: patterns,
        names: patternNames,
    },
    patterns: require("../../../demo/example-data/horizon_patterns.json"),

    spacers: [312, 255],
    wellDistances: {
        units: "m",
        distances: [2048.3, 512.7],
    },

    axisTitles: axisTitles,
    axisMnemos: axisMnemos,
};
