import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import DateTimeSlider from "./DateTimeSlider";

describe("Test  Date-Time Slider", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <DateTimeSlider /> }));
        render(Wrapper({ children: <DateTimeSlider /> }));
        expect(container.firstChild).toMatchSnapshot();
    });
    it("test slider", async () => {
        render(Wrapper({ children: <DateTimeSlider /> }));
        userEvent.type(screen.getByRole("slider"), "{arrowright}");
        expect(testStore.dispatch).toHaveBeenCalledTimes(2);
        expect(testStore.dispatch).toHaveBeenNthCalledWith(1, {
            payload: undefined,
            type: "ui/updateCurrentDateTime",
        });
        expect(testStore.dispatch).toHaveBeenNthCalledWith(2, {
            payload: "2018-03-01",
            type: "ui/updateCurrentDateTime",
        });
    });
});
