import React from "react";

import { type SubsurfaceViewerProps } from "../SubsurfaceViewer";

import { StorybookHelper } from "./sharedHelperFunctions";

type InjectedPropsFunction = () => Record<string, unknown>;

/**
 * Creates a wrapper component that injects additional props before rendering the target component.
 *
 * Use this when Storybook controls or another caller need to supply non-JSON values or derived
 * values that should be merged into the rendered component's props on each render.
 *
 * @typeParam COMP - The prop type of the wrapped component.
 * @param injectedProps - A static object or a function that returns the props to inject.
 * @param Comp - The component that should receive the merged props.
 * @returns A React component that merges the injected props with its own props and renders `Comp`.
 *
 * @example
 * ```typescript
import SubsurfaceViewer from "../../SubsurfaceViewer";

import { getPropsInjectorComponent } from "../sharedHelperComponents";

const SubsurfaceViewerPropsInjector = getPropsInjectorComponent(
    getInjectedProps,
    SubsurfaceViewer
);

const stories: Meta = {
    component: SubsurfaceViewerPropsInjector,
    title: "SubsurfaceViewer / Triangle Layer",
};
export default stories;

const surfacePoints: number[] = [...]; // Some large array of points
const surfaceTriangles: number[] = [...]; // Some large array of triangle indices

// ---------In-place array data handling (storybook fails to rebuild non JSon data)--------------- //
const typedDataSurfaceLayerId = "typedData_surface_layer";

const injectedProps = {
    [typedDataSurfaceLayerId]: {
        pointsData: new Float32Array(surfacePoints),
        triangleData: new Uint32Array(surfaceTriangles),
        unusedData: new Float32Array(surfacePoints),
    },
};

function getInjectedProps() {
    return injectedProps;
}

const typedDataSurfaceLayer = {
    "@@type": "TriangleLayer",
    id: typedDataSurfaceLayerId,
    "@@typedArraySupport": true,

    pointsData: "pointsData proxy",
    triangleData: "triangleData proxy",
};

export const TypedSurfaceDataStory: StoryObj<typeof SubsurfaceViewerPropsInjector> = {
    args: {
        id: "subsurface_viewer",
        layers: [typedDataSurfaceLayer, otherLayer],
    },
};
 * ```
 * In this example, only the values of the existing pointsData and triangleData properties of the layer(s)
 * with id "typedDataSurfaceLayerId" are replaced with the initial data.
 * 'unusedData' value is not added to layer, as it is not a field of the layer.
 * 
 * @example
 * ```typescript
// Non-json data to be injected into the layers.
const injectedProps = {
    [typedDataSurfaceLayerId]: {
        triangles:  [
            {
                vertices: new Float32Array(sectionZ0Vertices),
                vertexIndices: {
                    value: new Uint32Array(sectionZ0Indices),
                },
            },
        ],
    },
};

const ComplexDataLayer = {
    "@@type": "GpglValueMappedSurfaceLayer",
    "@@typedArraySupport": true,
    id: typedDataSurfaceLayerId,
    valueMappedTriangles: [
        {
            topology: "triangle-strip",
            vertices: "vertices proxy",
            vertexIndices: {
                value: "value proxy",
                size: 4,
            },
        },
    ],
    showMesh: true,
    ZIncreasingDownwards: true,
};
 * ``` */
export function getPropsInjectorComponent<COMP extends SubsurfaceViewerProps>(
    injectedProps: Record<string, unknown> | InjectedPropsFunction,
    Comp: React.FC<COMP>
) {
    const PropsInjectingComponent: React.FC<COMP> = (props) => {
        const propsInjector = React.useMemo(() => {
            return new StorybookHelper();
        }, []);

        const processedProps = React.useMemo(() => {
            const resolvedInjectedProps =
                typeof injectedProps === "function"
                    ? injectedProps()
                    : injectedProps;
            return propsInjector.injectFields(props, resolvedInjectedProps);
        }, [props, propsInjector]);

        return <Comp {...processedProps} />;
    };
    return PropsInjectingComponent;
}
