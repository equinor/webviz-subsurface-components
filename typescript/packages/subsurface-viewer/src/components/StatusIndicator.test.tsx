import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
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
