import React from "react";
import { SubsurfaceViewerProps } from "@webviz/subsurface-viewer";

const SubsurfaceViewerComponent = React.lazy(
    () => import("@webviz/subsurface-viewer")
);

const SubsurfaceViewer: React.FC<SubsurfaceViewerProps> = (props) => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <SubsurfaceViewerComponent {...props} />
        </React.Suspense>
    );
};

SubsurfaceViewer.displayName = "SubsurfaceViewer";

export default SubsurfaceViewer;
