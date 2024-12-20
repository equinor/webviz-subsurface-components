import React from "react";
import type { SubsurfaceViewerProps } from "./SubsurfaceViewer";
import SubsurfaceViewer from "./SubsurfaceViewer";
import { View } from "@deck.gl/core";
import { ViewAnnotation } from "./components/ViewAnnotation";

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
