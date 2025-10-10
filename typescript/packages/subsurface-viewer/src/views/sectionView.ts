import { OrthographicView } from "@deck.gl/core";
import type {
    OrthographicViewState,
    OrthographicViewProps,
} from "@deck.gl/core";
import { SectionViewport } from "../viewports/sectionViewport";

export type SectionViewState = OrthographicViewState;

export type SectionViewProps = OrthographicViewProps;

export class SectionView extends OrthographicView {
    static displayName = "SectionView";

    constructor(props: SectionViewProps = {}) {
        super(props);
    }

    getViewportType() {
        return SectionViewport;
    }
}
