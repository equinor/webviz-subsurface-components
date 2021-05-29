import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, queryByAttribute, getByRole } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
        const {container} = render(<TimeRangeSelector />, {
            wrapper: Wrapper,
        });
        userEvent.type(screen.getByRole('slider'), '{arrowright}')
        expect(testStore.dispatch).toHaveBeenCalledTimes(2);
        expect(testStore.dispatch).toBeCalledWith({
            payload: [0, -1],
            type: "ui/updateTimeIndexRange",
        }); 
});
});
