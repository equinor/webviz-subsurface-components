import React from "react";
import type { SubsurfaceViewerProps } from "./SubsurfaceViewer";
import SubsurfaceViewer from "./SubsurfaceViewer";
import { View } from "@deck.gl/core";

function mapAnnotation(annotationContainers: React.ReactNode) {
    return React.Children.map(annotationContainers, (annotationContainer) => {
        const viewId = (annotationContainer as React.ReactElement).key;
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
