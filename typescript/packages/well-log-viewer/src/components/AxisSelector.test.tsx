import { render, screen } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import AxisSelector from "./AxisSelector";

describe("Test Axis Selector", () => {
    it("snapshot test", () => {
        const { container } = render(
            <AxisSelector
                header="Primary scale"
                axes={["md", "tvd"]}
                axisTitles={{ md: "MD", tvd: "TVD" }}
                value="md"
                onChange={(value: string) => value}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    // Below test is failing
    it("update axis to TVD", () => {
        const mockFn = jest.fn();
        render(
            <AxisSelector
                header="Primary scale"
                axes={["md", "tvd"]}
                axisTitles={{ md: "MD", tvd: "TVD" }}
                value="md"
                onChange={mockFn}
            />
        );
        const axis_selectors = screen.getAllByRole("radio");
        userEvent.click(axis_selectors[1]);
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith("tvd");
    });
    it("test when there no axes- empty rendering", () => {
        const { container } = render(
            <AxisSelector
                header="Primary scale"
                axes={[]}
                axisTitles={{ md: "MD", tvd: "TVD" }}
                value="md"
                onChange={(value: string) => value}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
