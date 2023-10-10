import React from "react";
import { SubsurfaceViewerProps } from "@webviz/subsurface-viewer";

const DashSubsurfaceViewerComponent = React.lazy(() =>
    import(
        /* webpackChunkName: "webviz-subsurface-viewer" */ "@webviz/subsurface-viewer"
    ).then((module) => ({
        default:
            module.DashSubsurfaceViewer as unknown as React.ComponentType<SubsurfaceViewerProps>,
    }))
);

const DashSubsurfaceViewer: React.FC<SubsurfaceViewerProps> = (props) => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <DashSubsurfaceViewerComponent {...props} />
        </React.Suspense>
    );
};

DashSubsurfaceViewer.displayName = "DashSubsurfaceViewer";

export default DashSubsurfaceViewer;
