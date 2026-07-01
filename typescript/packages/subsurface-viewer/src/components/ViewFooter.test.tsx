import React from "react";

import "jest";
import { describe, expect, it } from "@jest/globals";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import "jest-styled-components";

import { ViewFooter } from "./ViewFooter";

describe("Test View Footer", () => {
    it("snapshot test with no props", () => {
        const { container } = render(<ViewFooter />);
        expect(container.firstChild).toMatchSnapshot();
    });
});
