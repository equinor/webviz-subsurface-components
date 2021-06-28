import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import WellAttributesSelector from "./WellAttributesSelector";

//Manually add the scrollTo because it is not implemented in jsdom
//Without it, the SmartNodeSelector reports TypeError: suggestionsRef.current.scrollTo is not a function
Element.prototype.scrollTo = jest.fn();

describe("test well attributes selector", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <WellAttributesSelector /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("click to dispatch redux action", async () => {
        render(<WellAttributesSelector />, {
            wrapper: Wrapper,
        });

        const attributeFilter = screen.getByRole("textbox");
        fireEvent.change(attributeFilter, {
            target: { value: "type:Injector" },
        });
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["type:Injector"],
            type: "ui/updateFilterByAttributes",
        });
    });
});
