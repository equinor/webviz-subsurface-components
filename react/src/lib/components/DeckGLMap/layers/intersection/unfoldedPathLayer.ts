import { PathLayer, PathLayerProps } from "@deck.gl/layers";
import { Feature } from "geojson";
import unfoldedPathShaderVsGlsl from "./unfoldedPathShader.vs.glsl";

interface UnfoldedPathLayerProps<D> extends PathLayerProps<D> {
    isIntersectionView?: boolean;
}

class UnfoldedPathLayer<D = Feature> extends PathLayer<
    D,
    UnfoldedPathLayerProps<D>
> {
    getShaders(): any {
        const parentShaders = super.getShaders();
        // use either vertex shader or inject
        // vertex shader supports position modification in world space and
        // inject vs:DECKGL_FILTER_GL_POSITION allows modification in clip space
        return {
            ...parentShaders,
            vs: unfoldedPathShaderVsGlsl,
            // inject: {
            //     "vs:DECKGL_FILTER_GL_POSITION": `
            //         position.y = position.y * 0.5;
            //     `,
            // },
        };
    }
}

export default UnfoldedPathLayer;
UnfoldedPathLayer.layerName = "UnfoldedPathLayer";
