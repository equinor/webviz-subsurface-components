import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import userEvent from "@testing-library/user-event";
import { testStore, Wrapper } from "../../test/TestWrapper";
import Settings from "./Settings";

describe("test hide zero completions switch", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <Settings /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});