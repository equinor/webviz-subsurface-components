import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
        // SmartNodeSelector calls parent's setProps on mount
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: [],
            type: "ui/updateFilterByAttributes",
        });
    });

    it("click to dispatch redux action", async () => {
        render(Wrapper({ children: <WellAttributesSelector /> }));
        // SmartNodeSelector calls parent's setProps on mount
        expect(testStore.dispatch).toHaveBeenCalledTimes(2);
        expect(testStore.dispatch).toBeCalledWith({
            payload: [],
            type: "ui/updateFilterByAttributes",
        });

        const attributeFilter = screen.getByRole("textbox");
        userEvent.type(attributeFilter, "type:Injector");
        fireEvent.keyDown(attributeFilter, { key: "Enter" });
        fireEvent.keyUp(attributeFilter, { key: "Enter" });
        expect(testStore.dispatch).toHaveBeenCalledTimes(3);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["type:Injector"],
            type: "ui/updateFilterByAttributes",
        });
    });
});
