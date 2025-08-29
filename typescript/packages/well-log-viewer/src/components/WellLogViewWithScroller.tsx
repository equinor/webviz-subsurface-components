import React, { useRef, useCallback, useEffect } from "react";

import WellLogView from "./WellLogView";
import type { WellLogViewProps } from "./WellLogView";
import { argTypesWellLogViewProp } from "./WellLogView";
import { _propTypesWellLogView } from "./WellLogView";

import type { WellLogController } from "./WellLogView";

import Scroller from "./Scroller";
import type { ScrollerRef } from "./Scroller";

export type WellLogViewWithScrollerProps = WellLogViewProps;
export const argTypesWellLogViewScrollerProp = argTypesWellLogViewProp;

const WellLogViewWithScroller: React.FC<WellLogViewWithScrollerProps> = (
    props
) => {
    const controllerRef = useRef<WellLogController | null>(null);
    const scrollerRef = useRef<ScrollerRef>(null);
    const skipScrollNotificationRef = useRef<number>(0);

    const calcPosTrack = useCallback((f: number): number => {
        const controller = controllerRef.current;
        if (!controller) return 0;
        const posMax = controller.getTrackScrollPosMax();
        const posTrack = f * posMax;
        return Math.round(posTrack);
    }, []);

    const getContentPosFraction = useCallback((): number => {
        const controller = controllerRef.current;
        if (!controller) return 0;
        const baseDomain = controller.getContentBaseDomain();
        const domain = controller.getContentDomain();
        const w = baseDomain[1] - baseDomain[0] - (domain[1] - domain[0]);
        return w ? (domain[0] - baseDomain[0]) / w : 0;
    }, []);

    const getTrackPosFraction = useCallback((): number => {
        const controller = controllerRef.current;
        if (!controller) return 0;
        return controller.getTrackScrollPosMax()
            ? controller.getTrackScrollPos() / controller.getTrackScrollPosMax()
            : 0.0;
    }, []);

    const setScrollerPosAndZoom = useCallback((): void => {
        let x: number, y: number;
        let xZoom: number, yZoom: number;
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const controller = controllerRef.current;
        if (!controller) {
            x = y = 0.0;
            xZoom = yZoom = 1.0;
        } else {
            const contentZoom = controller.getContentZoom();
            const trackZoom = controller.getTrackZoom();
            xZoom = props.horizontal ? contentZoom : trackZoom;
            yZoom = props.horizontal ? trackZoom : contentZoom;

            const fContent = getContentPosFraction();
            const fTrack = getTrackPosFraction();
            x = props.horizontal ? fContent : fTrack;
            y = props.horizontal ? fTrack : fContent;
        }

        scroller.zoom(xZoom, yZoom);

        let shouldUpdateScroller = 2;
        {
            // compare with current values from scroller
            const _x = scroller.getScrollX();
            const _y = scroller.getScrollY();
            const _posTrack = calcPosTrack(props.horizontal ? _y : _x);
            const posTrack = calcPosTrack(props.horizontal ? y : x);
            if (posTrack === _posTrack) {
                shouldUpdateScroller--;
                if (props.horizontal) {
                    y = _y;
                } else {
                    x = _x;
                }
            }
            const _fContent = props.horizontal ? _x : _y;
            const fContent = props.horizontal ? x : y;
            if (Math.abs(fContent - _fContent) < 0.001) {
                shouldUpdateScroller--;
                if (props.horizontal) {
                    x = _x;
                } else {
                    y = _y;
                }
            }
        }
        if (shouldUpdateScroller) {
            if (scroller.scrollTo(x, y)) skipScrollNotificationRef.current++; // skip self-induced notification
        }
    }, [
        props.horizontal,
        getContentPosFraction,
        getTrackPosFraction,
        calcPosTrack,
    ]);

    // callback function from WellLogView
    const onCreateController = useCallback(
        (controller: WellLogController) => {
            controllerRef.current = controller;
            props.onCreateController?.(controller);
        },
        [props]
    );

    // callback function from WellLogView
    const onTrackScroll = useCallback(() => {
        setScrollerPosAndZoom();
        props.onTrackScroll?.();
    }, [setScrollerPosAndZoom, props]);

    // callback function from WellLogView
    const onTrackSelection = useCallback(() => {
        props.onTrackSelection?.();
    }, [props]);

    // callback function from WellLogView
    const onContentRescale = useCallback(() => {
        setScrollerPosAndZoom();
        props.onContentRescale?.();
    }, [setScrollerPosAndZoom, props]);

    // callback function from WellLogView
    const onContentSelection = useCallback(() => {
        props.onContentSelection?.();
    }, [props]);

    // callback function from Scroller
    const onScrollerScroll = useCallback(
        (x: number, y: number) => {
            if (skipScrollNotificationRef.current) {
                // the notification is self-induced
                skipScrollNotificationRef.current--;
                return;
            }

            const controller = controllerRef.current;
            if (!controller) return;

            const fContent = props.horizontal ? x : y; // fraction
            controller.scrollContentTo(fContent);

            const posTrack = calcPosTrack(props.horizontal ? y : x);
            controller.scrollTrackTo(posTrack);
        },
        [props.horizontal, calcPosTrack]
    );

    useEffect(() => {
        setScrollerPosAndZoom();
    }, [setScrollerPosAndZoom]); // componentDidMount equivalent

    return (
        <Scroller ref={scrollerRef} onScroll={onScrollerScroll}>
            <WellLogView
                // copy all props
                {...props}
                // redefine some callbacks
                onCreateController={onCreateController}
                onTrackScroll={onTrackScroll}
                onTrackSelection={onTrackSelection}
                onContentRescale={onContentRescale}
                onContentSelection={onContentSelection}
            />
        </Scroller>
    );
};

// Add propTypes for backward compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(WellLogViewWithScroller as any).propTypes = _propTypesWellLogView();

export default WellLogViewWithScroller;
