import { render } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper } from "../../test/TestWrapper";
import Settings from "./Settings";

describe("test settings component", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <Settings /> }));
        expect(container.firstChild).toMatchSnapshot();
    });
    it("test hide layers settings button", () => {
        render(Wrapper({ children: <Settings /> }));
    });
});
