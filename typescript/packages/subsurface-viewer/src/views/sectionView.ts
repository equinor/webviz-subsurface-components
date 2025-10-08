import { OrthographicController, View } from "@deck.gl/core";
import type {
    CommonViewProps,
    CommonViewState,
} from "@deck.gl/core/dist/views/view";
import { SectionViewport } from "../viewports/sectionViewport";

export type SectionViewState = {
    /** The world position at the center of the viewport. Default `[0, 0, 0]`. */
    target?: [number, number, number] | [number, number];
    /**  The zoom level of the viewport. `zoom: 0` maps one unit distance to one pixel on screen, and increasing `zoom` by `1` scales the same object to twice as large.
     *   To apply independent zoom levels to the X and Y axes, supply an array `[zoomX, zoomY]`. Default `0`. */
    zoom?: number | [number, number];
    /** The min zoom level of the viewport. Default `-Infinity`. */
    minZoom?: number;
    /** The max zoom level of the viewport. Default `Infinity`. */
    maxZoom?: number;
} & CommonViewState;

export type SectionViewProps = {
    /** Distance of near clipping plane. Default `0.1`. */
    near?: number;
    /** Distance of far clipping plane. Default `1000`. */
    far?: number;
    /** Whether to use top-left coordinates (`true`) or bottom-left coordinates (`false`). Default `true`. */
    flipY?: boolean;
} & CommonViewProps<SectionViewState>;

export class SectionView extends View<SectionViewState, SectionViewProps> {
    static displayName = "SectionView";

    constructor(props: SectionViewProps = {}) {
        super(props);
    }

    getViewportType() {
        return SectionViewport;
    }

    get ControllerType() {
        return OrthographicController;
    }
}
