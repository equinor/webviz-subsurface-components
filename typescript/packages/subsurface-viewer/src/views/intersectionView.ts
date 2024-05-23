import type { OrthographicViewState } from "@deck.gl/core";
import { View } from "@deck.gl/core";
import type { CommonViewProps } from "@deck.gl/core/dist/views/view";
import IntersectionViewport from "../viewports/intersectionViewport";

// IntersectionViewState and IntersectionViewProps may need to have its own implementation when defining pan and zoom controls
export type IntersectionViewState = OrthographicViewState;

type IntersectionViewProps = CommonViewProps<IntersectionViewState> & {
    /** Distance of near clipping plane. Default `0.1`. */
    near?: number;
    /** Distance of far clipping plane. Default `1000`. */
    far?: number;
    /** Whether to use top-left coordinates (`true`) or bottom-left coordinates (`false`). Default `true`. */
    flipY?: boolean;
};

export default class IntersectionView extends View<
    IntersectionViewState,
    IntersectionViewProps
> {
    static displayName = "IntersectionView";
    constructor(props: IntersectionViewProps) {
        super({
            ...props,
            controller: false,
            viewState: {
                target: [275, 0, -500],
            },
        });
    }

    get ViewportType(): typeof IntersectionViewport {
        return IntersectionViewport;
    }

    get ControllerType(): never {
        throw new Error("Method not implemented.");
    }
}
