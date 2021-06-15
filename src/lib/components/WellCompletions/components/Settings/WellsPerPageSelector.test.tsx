import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import WellsPerPageSelector from "./WellsPerPageSelector";

describe("test number of Wells per page", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <WellsPerPageSelector /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("click to dispatch redux action", async () => {
        render(<WellsPerPageSelector />, {
            wrapper: Wrapper,
        });
        fireEvent.change(screen.getByLabelText("Wells per page"), {
            target: { value: "50" },
        });
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: "50",
            type: "ui/updateWellsPerPage",
        });
    });
});
