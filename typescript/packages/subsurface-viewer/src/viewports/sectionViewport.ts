import { OrthographicViewport } from "@deck.gl/core";

export class SectionViewport extends OrthographicViewport {
    constructor(props: ConstructorParameters<typeof OrthographicViewport>[0]) {
        super(props);
    }
}
