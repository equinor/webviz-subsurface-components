import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import ZoneSelector from "./ZoneSelector";

describe("test Zone Selector", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <ZoneSelector /> }));
        expect(container.firstChild).toMatchSnapshot();
    });

    it("click to dispatch redux action remove all zones", async () => {
        render(Wrapper({ children: <ZoneSelector /> }));

        fireEvent.click(screen.getByRole("button", { name: /remove all/i }));
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: [],
            type: "ui/updateFilteredZones",
        });
    });

    it("select 'zone1' check box to dispatch redux action and show only zone1", async () => {
        render(Wrapper({ children: <ZoneSelector /> }));

        userEvent.click(screen.getByRole("button", { name: /remove all/i }));
        const zoneFilter = screen.getByText(/select zone\(s\)\.\.\./i);
        userEvent.click(zoneFilter);
        const dropdown = screen.getByPlaceholderText("Search...");
        await waitFor(() => expect(dropdown).toBeVisible());
        userEvent.type(dropdown, "{down}");
        userEvent.type(dropdown, "{enter}");

        expect(testStore.dispatch).toHaveBeenCalledTimes(3);
        expect(testStore.dispatch).toHaveBeenNthCalledWith(1, {
            payload: [],
            type: "ui/updateFilteredZones",
        });
        expect(testStore.dispatch).toHaveBeenNthCalledWith(2, {
            payload: [],
            type: "ui/updateFilteredZones",
        });
        expect(testStore.dispatch).toHaveBeenNthCalledWith(3, {
            payload: [
                "zone1.1",
                "zone1.2",
                "zone1.3",
                "zone2.1",
                "zone2.2",
                "zone2.3",
                "zone3.1",
                "zone3.2",
                "zone3.3",
                "zone4.1",
                "zone4.2",
                "zone4.3",
                "zone4.4",
                "zone4.5",
            ],
            type: "ui/updateFilteredZones",
        });
    });
});
