import { OrthographicViewport } from "@deck.gl/core";
import type { OrthographicViewportOptions } from "@deck.gl/core/dist/viewports/orthographic-viewport";

export type Padding = {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
};
export class SectionViewport extends OrthographicViewport {
    constructor(props: OrthographicViewportOptions) {
        const orthographicProps = {
            ...props,
            target: props.target as
                | [number, number, number]
                | [number, number]
                | undefined,
        };

        super(orthographicProps);
    }
}
