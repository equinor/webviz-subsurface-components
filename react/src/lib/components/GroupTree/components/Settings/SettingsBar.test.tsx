import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import SettingsBar from "./SettingsBar";

describe("Test Settins Bar component", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <SettingsBar /> }));
        expect(container.firstChild).toMatchSnapshot();
    });
});
