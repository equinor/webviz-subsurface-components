import React from "react";
import {
    MapMouseEvent,
    SubsurfaceViewerProps,
    ViewStateType,
} from "@webviz/subsurface-viewer";
import { DeckGLRef } from "@deck.gl/react";
import { PickingInfoPerView, useMultiViewPicking } from "@webviz/subsurface-viewer/src/hooks/useMultiViewPicking";
import { useMultiViewCursorTracking } from "@webviz/subsurface-viewer/src/hooks/useMultiViewCursorTracking";
import { isEqual } from "lodash";
import ViewAnnotation from "../ViewAnnotation/ViewAnnotation";

const SubsurfaceViewerComponent = React.lazy(() =>
    import(
        /* webpackChunkName: "webviz-subsurface-viewer" */ "@webviz/subsurface-viewer"
    ).then((module) => ({
        default:
            module.DashSubsurfaceViewer as unknown as React.ComponentType<SubsurfaceViewerProps>,
    }))
);

const SubsurfaceViewer: React.FC<SubsurfaceViewerProps> = (props) => {
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
    props: SubsurfaceViewerProps &
        Required<Pick<SubsurfaceViewerProps, "views">>
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
    
    const children = React.Children.toArray(props.children);
    for (const viewport of adjustedViewports) {
        children.push(
            <ViewAnnotation key={viewport.id} id={viewport.id}>
                <ReadoutComponent
                    viewId={viewport.id}
                    pickingInfoPerView={pickingInfoPerView}
                />
            </ViewAnnotation>
        );
    }

    return (
        <div
            onMouseEnter={() => setMouseHover(true)}
            onMouseLeave={() => setMouseHover(false)}
            onBlur={() => setMouseHover(false)}
            onFocus={() => setMouseHover(true)}
        >
            <SubsurfaceViewerComponent
                {...props}
                coords={{visible: false}}
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

function ReadoutComponent(props: {
    viewId: string;
    pickingInfoPerView: PickingInfoPerView;
}): React.ReactNode {
    return (
        <div
            style={{
                position: "absolute",
                bottom: 8,
                left: 8,
                background: "#fff",
                padding: 8,
                borderRadius: 4,
                display: "grid",
                gridTemplateColumns: "8rem auto",
                border: "1px solid #ccc",
                fontSize: "0.8rem",
            }}
        >
            <div>X:</div>
            <div>
                {roundToSignificant(props.pickingInfoPerView[props.viewId]?.coordinates
                    ?.at(0))}
            </div>
            <div>Y:</div>
            <div>
            {roundToSignificant(props.pickingInfoPerView[props.viewId]?.coordinates
                    ?.at(1))}
            </div>
            {props.pickingInfoPerView[props.viewId]?.layerPickingInfo.map(
                (el) => (
                    <React.Fragment key={`${el.layerId}`}>
                        <div style={{ fontWeight: "bold" }}>{el.layerName}</div>
                        {el.properties.map((prop, i) => (
                            <React.Fragment key={`${el.layerId}-${i}}`}>
                                <div style={{ gridColumn: 1 }}>{prop.name}</div>
                                <div>
                                    {typeof prop.value === "string"
                                        ? prop.value
                                        : roundToSignificant(prop.value)}
                                </div>
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                )
            ) ?? ""}
        </div>
    );
}

const roundToSignificant = function (num: number | undefined) {
    if (num === undefined) {
        return "-";
    }
    // Returns two significant figures (non-zero) for numbers with an absolute value less
    // than 1, and two decimal places for numbers with an absolute value greater
    // than 1.
    return parseFloat(
        num.toExponential(Math.max(1, 2 + Math.log10(Math.abs(num))))
    );
};

SubsurfaceViewer.displayName = "SubsurfaceViewer";

export default SubsurfaceViewer;
