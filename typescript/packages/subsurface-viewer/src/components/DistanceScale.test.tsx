import React from "react";

import "jest";
import { describe, expect, it } from "@jest/globals";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import "jest-styled-components";

import { DistanceScale } from "./DistanceScale";

describe("Test DistanceScale", () => {
    it("snapshot test with default props", () => {
        const { container } = render(<DistanceScale />);
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test with invalid props", () => {
        const { container } = render(
            <DistanceScale
                zoom={0}
                incrementValue={0}
                widthPerUnit={0}
                style={{ top: 0, left: 0 }}
                scaleUnit="m"
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test with higher zoom", () => {
        const { container } = render(
            <DistanceScale
                zoom={1}
                incrementValue={100}
                widthPerUnit={100}
                style={{ top: 10, left: 10 }}
                scaleUnit="m"
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
