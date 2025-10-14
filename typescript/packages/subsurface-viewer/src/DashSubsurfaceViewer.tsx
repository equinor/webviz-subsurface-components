import React from "react";
import type { SubsurfaceViewerProps, ViewsType } from "./SubsurfaceViewer";
import SubsurfaceViewer from "./SubsurfaceViewer";
import { View } from "@deck.gl/core";
import { ViewAnnotation } from "./components/ViewAnnotation";
import type { ViewportType } from "./views/viewport";
import type { ViewTypeType } from "./components/Map";

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

type DashViewTypeType = Omit<ViewTypeType, "SectionView">;

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

const DashSubsurfaceViewer: React.FC<DashSubsurfaceViewerProps> = (props) => {
    const { children, views, ...rest } = props;

    // Helper to convert DashViewTypeType to ViewTypeType
    function convertViewType(
        viewType?: DashViewTypeType
    ): ViewTypeType | undefined {
        // If viewType is already a valid ViewTypeType, return as is
        // Otherwise, handle conversion logic here if needed
        return viewType as unknown as ViewTypeType;
    }

    // Convert DashViewsType to ViewsType if views is provided
    const convertedViews = views
        ? {
              ...views,
              viewports: Array.isArray(views.viewports)
                  ? views.viewports.map((vp) => ({
                        ...vp,
                        viewType: convertViewType(vp.viewType),
                    }))
                  : [
                        {
                            ...views.viewports,
                            viewType: convertViewType(views.viewports.viewType),
                        },
                    ],
          }
        : undefined;

    return (
        <SubsurfaceViewer {...rest} views={convertedViews}>
            {mapAnnotation(children)}
        </SubsurfaceViewer>
    );
};

export default DashSubsurfaceViewer;
