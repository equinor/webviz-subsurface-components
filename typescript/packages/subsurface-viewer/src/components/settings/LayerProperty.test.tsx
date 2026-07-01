import React from "react";

import "jest";
import { describe, expect, it } from "@jest/globals";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import "jest-styled-components";

import { EmptyWrapper } from "../../test/TestWrapper";
import LayerProperty from "./LayerProperty";

const drawingLayer = {
    "@@type": "DrawingLayer",
    name: "Drawing",
    id: "drawing-layer",
    pickable: true,
    visible: true,
    mode: "drawLineString",

    // Props used to get/set data in the drawing layer.
    selectedFeatureIndexes: [] as number[],
    data: {
        type: "FeatureCollection",
        features: [],
    },
};

describe("Test LayerProperty", () => {
    it("snapshot test", () => {
        const { container } = drawingLayer
            ? render(
                  EmptyWrapper({
                      children: <LayerProperty layer={drawingLayer} />,
                  })
              )
            : render(<div />);
        expect(container.firstChild).toMatchSnapshot();
    });
});
