import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import WellAttributesSelector from "./WellAttributesSelector";

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
        
        const attributeFilter = screen.getByRole('textbox')
        userEvent.type(attributeFilter, 'type:Injector{enter}')
        await waitFor(() => expect(screen.getByText(/well selection criteria: "type" is "injector"/i)).toBeVisible())
        expect(testStore.dispatch).toHaveBeenCalledTimes(1)
        expect(testStore.dispatch).toBeCalledWith({
            payload: ['type:injector'],
            type: "ui/updateFilterByAttributes",
        });
    });
});
