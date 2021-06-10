import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../../test/TestWrapper";
import WellAttributesSelector from "./WellAttributesSelector";

describe("test well attributes selector", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <WellAttributesSelector /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
