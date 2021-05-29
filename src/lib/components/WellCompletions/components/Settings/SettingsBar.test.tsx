
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import SettingsBar from "./SettingsBar";

/*
The following tests are breaking due to jest trying to parse a non-js file,
needs investigation to solve this problem.
*/
describe("test settings bar", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <SettingsBar /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});