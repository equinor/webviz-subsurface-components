import React from "react";

import "jest";
import { describe, expect, it } from "@jest/globals";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import "jest-styled-components";

import StatusIndicator from "./StatusIndicator";

describe("Test Status Indicator", () => {
    it("snapshot test with no props", () => {
        const { container } = render(
            // @ts-expect-error TS2322
            <StatusIndicator layers={[]} isLoaded={true} />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
