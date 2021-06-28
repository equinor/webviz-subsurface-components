import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import TimeAggregationSelector from "./TimeAggregationSelector";

describe("test range display mode selector", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <TimeAggregationSelector /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("click to dispatch redux action", async () => {
        render(<TimeAggregationSelector />, {
            wrapper: Wrapper,
        });
        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "Average" },
        });
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: "Average",
            type: "ui/updateTimeAggregation",
        });
    });
});
