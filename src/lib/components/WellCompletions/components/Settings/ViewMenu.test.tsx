import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../../test/TestWrapper";
import ViewMenu from "./ViewMenu";

describe("test view menu", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <ViewMenu /> }));
        expect(container.firstChild).toMatchSnapshot();
    });

    it("click to display menu", async () => {
        render(<ViewMenu />, {
            wrapper: Wrapper,
        });
        fireEvent.click(screen.getByRole("button", { name: "" }));
        expect(screen.getAllByRole("menu", { name: "" })).toHaveLength(1);
    });
});
