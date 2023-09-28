import React from "react";
import SubsurfaceViewer, { SubsurfaceViewerProps } from "./SubsurfaceViewer";
import { View } from "@deck.gl/core/typed";

function mapAnnotation(annotationContainers: React.ReactNode) {
    return React.Children.map(annotationContainers, (annotationContainer) => {
        const viewId = (annotationContainer as React.ReactElement).key;
        return (
            // @ts-expect-error
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
