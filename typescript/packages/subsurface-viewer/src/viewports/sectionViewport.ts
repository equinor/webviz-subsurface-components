import { OrthographicViewport } from "@deck.gl/core";
import type { OrthographicViewportOptions } from "@deck.gl/core/dist/viewports/orthographic-viewport";

export class SectionViewport extends OrthographicViewport {
    constructor(props: OrthographicViewportOptions) {
        super(props);
    }
}
