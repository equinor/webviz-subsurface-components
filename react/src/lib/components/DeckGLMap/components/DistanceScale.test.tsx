import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import DistanceScale from "./DistanceScale";

describe("Test Color Legend", () => {
    it("snapshot test", () => {
        const { container } = render(<DistanceScale />);
        expect(container.firstChild).toMatchSnapshot();
    });
    it("snapshot test with real props", () => {
        const { container } = render(
            <DistanceScale
                zoom={0}
                incrementValue={0}
                widthPerUnit={0}
                position={[0, 0]}
                scaleUnit="m"
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
