import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper, testStore } from "../../test/TestWrapper";
import SortTable from "./SortTable";

describe("test sorting the table", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <SortTable /> }));
        expect(container.firstChild).toMatchSnapshot();
    });

    it("dispatch redux action - add sorting level", async () => {
        render(<SortTable />, {
            wrapper: Wrapper,
        });
        fireEvent.click(screen.getByRole("button", { name: "Ascending" }));
        await screen.findByText("Descending");
        fireEvent.click(
            screen.getByRole("button", { name: /add sorting level/i })
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: {
                sortKey: "well name",
                sortDirection: "Descending",
            },
            type: "ui/updateSortKey",
        });
    });
});
