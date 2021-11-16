import { render, screen } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import userEvent from "@testing-library/user-event";
import InfoPanel from "./InfoPanel";

describe("Test Info panel", () => {
    it("snapshot test", () => {
        const { container } = render(<InfoPanel header="Readout" infos={[]} />);
        expect(container.firstChild).toMatchSnapshot();
    });
    it("update axis to TVD", () => {
        const mockFn = jest.fn();
        render(<InfoPanel header="Readout" infos={[]} />);
        const axis_selectors = screen.getAllByRole("radio");
        expect(axis_selectors[0]).toBeChecked();
        userEvent.click(axis_selectors[1]);
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(mockFn).toHaveBeenCalledWith("tvd");
        expect(axis_selectors[1]).toBeChecked();
    });
});
