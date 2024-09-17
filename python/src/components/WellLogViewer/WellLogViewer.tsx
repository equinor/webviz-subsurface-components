import React from "react";

const WellLogViewerComponent = React.lazy(() =>
    import(
        /* webpackChunkName: "webviz-well-log-viewer" */ "@webviz/well-log-viewer"
    ).then((module) => ({
        default:
            module.WellLogViewer as unknown as React.ComponentType<WellLogViewerProps>,
    }))
);

// react-docgen / dash-generate-components/extract-meta.js does not properly parse
// the imported WellLogViewerProps. Hence, we have to recreate them here.
/**
 * WellLogView additional options
 */
type WellLogViewOptions = {
    /** The maximum zoom value */
    maxContentZoom?: number;

    /** The maximum number of visible tracks */
    maxVisibleTrackNum?: number;

    /** Validate JSON datafile against schema */
    checkDatafileSchema?: boolean;

    /** Hide titles of the track. Default is false */
    hideTrackTitle?: boolean;

    /** Hide legends of the track. Default is false */
    hideTrackLegend?: boolean;
};

/**
 * Options for readout panel
 */
type InfoOptions = {
    /** Show not only visible tracks */
    allTracks?: boolean;

    /** How group values. "" | "track" */
    grouping?: string;
};

type WellLogViewerProps = {
    /** The ID of this component, used to identify dash components in callbacks. The ID needs to be unique across all of the components in an app. */
    id: string;

    /** An object from JSON file describing well log data */
    welllog: object;

    /** Prop containing track template data */
    template: object;

    /** Prop containing color table data */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    colorTables: any[]; // specify the exact type if known

    /** Prop containing color function table */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    colorFunctions: any[]; // specify the exact type if known

    /** Orientation of the track plots on the screen. Default is false */
    horizontal?: boolean;

    /** Initial visible interval of the log data */
    domain?: number[];

    /** Initial selected interval of the log data */
    selection?: number[];

    /** Well picks data */
    wellpick?: object;

    /** Primary axis id: " md", "tvd", "time"... */
    primaryAxis?: string;

    /** Log mnemonics for axes */
    axisTitles?: object;

    /** Names for axes */
    axisMnemos?: object;

    /** Set to true for default titles or to array of individual well log titles */
    viewTitle?: boolean | string | object; // 'object' might be replaced by a specific type like ReactNode

    options?: WellLogViewOptions;

    readoutOptions?: InfoOptions;
};

const WellLogViewer: React.FC<WellLogViewerProps> = (props) => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <WellLogViewerComponent {...props} />
        </React.Suspense>
    );
};

WellLogViewer.displayName = "WellLogViewer";

export default WellLogViewer;
