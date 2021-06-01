import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../../test/TestWrapper";
import SettingsBar from "./SettingsBar";

/*
The following tests are breaking due to jest trying to parse a non-js file,
needs investigation to solve this problem.
*/
describe("test settings bar", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <SettingsBar /> }));
        expect(container.firstChild).toMatchSnapshot();
    });
});
