import React from "react";
import type { SubsurfaceViewerProps, ViewsType } from "./SubsurfaceViewer";
import SubsurfaceViewer from "./SubsurfaceViewer";
import { OrbitView, OrthographicView, View } from "@deck.gl/core";
import { ViewAnnotation } from "./components/ViewAnnotation";
import { ViewportType } from "./views/viewport";
import { ViewTypeType } from "./components/Map";

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

interface DashViewTypeType extends Omit<ViewTypeType, "SectionView"> {}

interface DashViewportType extends Omit<ViewportType, "viewType"> {
    viewType?: DashViewTypeType;
}

interface DashViewsType extends Omit<ViewsType, "viewports"> {
    viewports: DashViewportType;
}

export interface DashSubsurfaceViewerProps
    extends Omit<SubsurfaceViewerProps, "views"> {
    /**
     * Views configuration for map. If not specified, all the layers will be
     * displayed in a single 2D viewport
     */
    views?: DashViewsType;
}

const DashSubsurfaceViewer: React.FC<SubsurfaceViewerProps> = (props) => {
    const { children, ...rest } = props;
    return (
        <SubsurfaceViewer {...rest}>{mapAnnotation(children)}</SubsurfaceViewer>
    );
};

export default DashSubsurfaceViewer;
