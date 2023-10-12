import React from "react";
import type { ViewAnnotationProps } from "@webviz/subsurface-viewer/dist/components/ViewAnnotation";

const ViewAnnotationComponent = React.lazy(() =>
    import(
        /* webpackChunkName: "webviz-view-annotation" */ "@webviz/subsurface-viewer/dist/components/ViewAnnotation"
    ).then((module) => ({
        default:
            module.ViewAnnotation as unknown as React.ComponentType<ViewAnnotationProps>,
    }))
);

const ViewAnnotation = (props: ViewAnnotationProps) => {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <ViewAnnotationComponent {...props} />
        </React.Suspense>
    );
};

ViewAnnotation.defaultProps = {};

export default ViewAnnotation;
