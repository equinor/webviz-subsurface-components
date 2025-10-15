import { DeckGLRef } from "@deck.gl/react";
import {
    DashSubsurfaceViewerProps,
    MapMouseEvent,
} from "@webviz/subsurface-viewer";
import { useMultiViewCursorTracking } from "@webviz/subsurface-viewer/src/hooks/useMultiViewCursorTracking";
import { useMultiViewPicking } from "@webviz/subsurface-viewer/src/hooks/useMultiViewPicking";
import { isEqual } from "lodash";
import React from "react";

type ViewStateType = DashSubsurfaceViewerProps["cameraPosition"];

const SubsurfaceViewerComponent = React.lazy(() =>
    import(
        /* webpackChunkName: "webviz-subsurface-viewer" */ "@webviz/subsurface-viewer"
    ).then((module) => ({
        default:
            module.DashSubsurfaceViewer as unknown as React.ComponentType<DashSubsurfaceViewerProps>,
    }))
);

const SubsurfaceViewer: React.FC<DashSubsurfaceViewerProps> = (props) => {
    const { views, children, ...rest } = props;

    if (!views) {
        return (
            <React.Suspense fallback={<div>Loading...</div>}>
                <SubsurfaceViewerComponent {...rest}>
                    {props.children}
                </SubsurfaceViewerComponent>
            </React.Suspense>
        );
    }

    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <MultiViewSubsurfaceViewer {...rest} views={views}>
                {children}
            </MultiViewSubsurfaceViewer>
        </React.Suspense>
    );
};

function MultiViewSubsurfaceViewer(
    props: DashSubsurfaceViewerProps &
        Required<Pick<DashSubsurfaceViewerProps, "views">>
) {
    const { onMouseEvent, getCameraPosition } = props;

    const deckGlRef = React.useRef<DeckGLRef>(null);

    const [mouseHover, setMouseHover] = React.useState<boolean>(false);
    const [cameraPosition, setCameraPosition] = React.useState<
        ViewStateType | undefined
    >(undefined);
    const [prevCameraPosition, setPrevCameraPosition] = React.useState<
        ViewStateType | undefined
    >(undefined);

    if (!isEqual(prevCameraPosition, props.cameraPosition)) {
        setPrevCameraPosition(props.cameraPosition);
    }

    const { getPickingInfo, activeViewportId, pickingInfoPerView } =
        useMultiViewPicking({
            deckGlRef,
            multiPicking: true,
            pickDepth: 1,
        });

    const handleMouseEvent = React.useCallback(
        function handleMouseEvent(event: MapMouseEvent) {
            if (event.type === "hover") {
                getPickingInfo(event);
            }
            onMouseEvent?.(event);
        },
        [getPickingInfo, onMouseEvent]
    );

    const handleCameraPositionChange = React.useCallback(
        function handleCameraPositionChange(position: ViewStateType) {
            setCameraPosition(position);
            getCameraPosition?.(position);
        },
        [getCameraPosition]
    );

    const viewports = props.views?.viewports ?? [];
    const layers = props.layers ?? [];

    const { viewports: adjustedViewports, layers: adjustedLayers } =
        useMultiViewCursorTracking({
            activeViewportId,
            worldCoordinates:
                pickingInfoPerView[activeViewportId]?.coordinates ?? null,
            viewports,
            layers,
            crosshairProps: {
                color: [255, 255, 255, 255],
                sizePx: 32,
                visible: mouseHover,
            },
        });

    const foundViewAnnotations: string[] = [];
    const children = React.Children.map(props.children, (child) => {
        // Child wrapped in DashWrapper
        if (
            React.isValidElement(child) &&
            typeof child.props === "object" &&
            Object.keys(child.props).includes("_dashprivate_layout") &&
            child.props._dashprivate_layout.type === "ViewAnnotation"
        ) {
            const id = child.props._dashprivate_layout.props.id;
            const readout = adjustedViewports.find(
                (viewport) => viewport.id === id
            );
            if (!readout) {
                return child;
            }
            foundViewAnnotations.push(id);
            const newChild = React.cloneElement(child, {
                // @ts-expect-error - this is proven to be a valid prop in Dash components
                _dashprivate_layout: {
                    ...child.props._dashprivate_layout,
                    props: {
                        ...child.props._dashprivate_layout.props,
                        children: [
                            ...child.props._dashprivate_layout.props.children,
                            {
                                type: "ReadoutComponent",
                                props: {
                                    viewId: id,
                                    pickingInfoPerView,
                                },
                                namespace: "webviz_subsurface_components",
                            },
                        ],
                    },
                },
            });
            return newChild;
        }
    });

    return (
        <div
            onMouseEnter={() => setMouseHover(true)}
            onMouseLeave={() => setMouseHover(false)}
            onBlur={() => setMouseHover(false)}
            onFocus={() => setMouseHover(true)}
        >
            <SubsurfaceViewerComponent
                {...props}
                coords={{ visible: false }}
                onMouseEvent={handleMouseEvent}
                layers={adjustedLayers}
                views={{
                    ...props.views,
                    viewports: adjustedViewports,
                    layout: props.views.layout,
                }}
                cameraPosition={cameraPosition}
                deckGlRef={deckGlRef}
                getCameraPosition={handleCameraPositionChange}
            >
                {children}
            </SubsurfaceViewerComponent>
        </div>
    );
}

SubsurfaceViewer.displayName = "SubsurfaceViewer";

export default SubsurfaceViewer;
