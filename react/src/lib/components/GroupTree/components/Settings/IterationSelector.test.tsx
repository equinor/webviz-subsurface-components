import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import IterationSelector from "./IterationSelector";

describe("Test Iteration selector component", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <IterationSelector /> }));
        expect(container.firstChild).toMatchSnapshot();
    });
    it("select 'Iter_1' option to dispatch redux action", async () => {
        render(<IterationSelector />, {
            wrapper: Wrapper,
        });
        userEvent.selectOptions(screen.getByRole('combobox', {  name: /current iteration/i}), "Iter_1");
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toHaveBeenCalledWith({
            payload: ["Iter_1", "01/01/2000"],
            type: "ui/updateCurrentIteration",
        });
    });
});
