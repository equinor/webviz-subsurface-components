import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "jest-styled-components";
//import { times } from "lodash";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import TimeRangeSelector from "./TimeRangeSelector";

describe("test time range selector", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <TimeRangeSelector /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("click to dispatch redux action", async () => {
        render(Wrapper({ children: <TimeRangeSelector /> }));
        userEvent.type(screen.getByRole("slider"), "{arrowright}");
        expect(testStore.dispatch).toHaveBeenCalledTimes(2);
        expect(testStore.dispatch).toHaveBeenNthCalledWith(1, {
            payload: [0, NaN],
            type: "ui/updateTimeIndexRange",
        });
        expect(testStore.dispatch).toHaveBeenNthCalledWith(2, {
            payload: [0, 9],
            type: "ui/updateTimeIndexRange",
        });
    });
});
