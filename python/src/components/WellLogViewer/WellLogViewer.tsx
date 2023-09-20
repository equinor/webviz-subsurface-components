import React from "react";

const WellLogViewerComponent = React.lazy(() =>
    import("@webviz/well-log-viewer").then((module) => ({
        default:
            module.WellLogViewer as unknown as React.ComponentType<WellLogViewerProps>,
    }))
);

// react-docgen / dash-generate-components/extract-meta.js does not properly parse
// the imported WellLogViewerProps. Hence, we have to recreate them here.
type WellLogViewerProps = {
    id?: string;
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
