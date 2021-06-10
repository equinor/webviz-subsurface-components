import "@testing-library/jest-dom/extend-expect";
import "jest-styled-components";
import { render, fireEvent, screen, waitFor} from "@testing-library/react";
import React from "react";
import { Wrapper, testStore } from "../../test/TestWrapper";
import WellAttributesSelector from "./WellAttributesSelector";


describe("test well attributes selector", () => {
    it("snapshot test", () => {
        const { container } = render(
             Wrapper({ children: <WellAttributesSelector /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
