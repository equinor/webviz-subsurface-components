import React from "react";
import type { ViewFooterProps } from "@webviz/subsurface-viewer/dist/components/ViewFooter";

const ViewFooterComponent = React.lazy(() =>
    import(
        /* webpackChunkName: "webviz-view-footer" */ "@webviz/subsurface-viewer/dist/components/ViewFooter"
    ).then((module) => ({
        default:
            module.ViewFooter as unknown as React.ComponentType<ViewFooterProps>,
    }))
);

const ViewFooter = (props: ViewFooterProps) => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <ViewFooterComponent {...props} />
        </React.Suspense>
    );
};

ViewFooter.defaultProps = {};

export default ViewFooter;
