import { View } from "@deck.gl/core";
import React from "react";
import { ViewAnnotation } from "./components/ViewAnnotation";
import type { SubsurfaceViewerProps } from "./SubsurfaceViewer";
import SubsurfaceViewer from "./SubsurfaceViewer";

type ViewsType = Omit<SubsurfaceViewerProps["views"], "viewports"> & {
    // Dash does not support complex nested types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    viewports: any;
};

export type DashSubsurfaceViewerProps = Omit<SubsurfaceViewerProps, "views"> & {
    /**
     * An array of view definitions. If not provided, a single view is rendered.
     */
    views?: ViewsType;
};

function mapAnnotation(annotationContainers: React.ReactNode) {
    return React.Children.map(annotationContainers, (annotationContainer) => {
        let viewId = (annotationContainer as React.ReactElement).props.id;
        if (
            React.isValidElement(annotationContainer) &&
            (annotationContainer.type === ViewAnnotation ||
                (annotationContainer.props instanceof Object &&
                    Object.keys(annotationContainer.props).includes(
                        "_dashprivate_layout"
                    )))
        ) {
            viewId = annotationContainer.props._dashprivate_layout.props.id;
        }
        if (!viewId) {
            return null;
        }
        return (
            // @ts-expect-error This is proven to work in JavaScript
            <View key={viewId} id={viewId}>
                {annotationContainer}
            </View>
        );
    });
}

const DashSubsurfaceViewer: React.FC<SubsurfaceViewerProps> = (props) => {
    const { children, ...rest } = props;
    return (
        <SubsurfaceViewer {...rest}>{mapAnnotation(children)}</SubsurfaceViewer>
    );
};

export default DashSubsurfaceViewer;
