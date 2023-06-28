import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import { ViewFooter } from "./ViewFooter";

describe("Test View Footer", () => {
    it("snapshot test with no props", () => {
        const { container } = render(<ViewFooter />);
        expect(container.firstChild).toMatchSnapshot();
    });
});
