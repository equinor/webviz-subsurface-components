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
        render(<ZoneSelector />, {
            wrapper: Wrapper,
        });

        fireEvent.click(screen.getByRole("button", { name: /remove all/i }));
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: [],
            type: "ui/updateFilteredZones",
        });
    });

    it("select 'zone1' check box to dispatch redux action and show only zone1", async () => {
        render(<ZoneSelector />, {
            wrapper: Wrapper,
        });

        userEvent.click(screen.getByRole("button", { name: /remove all/i }));
        const zoneFilter = screen.getByText(/select zone\(s\)\.\.\./i)
        userEvent.click(zoneFilter)
        const dropdown = screen.getByPlaceholderText('Search...')
        await waitFor(() => expect(dropdown).toBeVisible())
        userEvent.type(dropdown, '{down}')
        userEvent.type(dropdown, '{enter}')

        expect(testStore.dispatch).toHaveBeenCalledTimes(3);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ['zone1'],
            type: "ui/updateFilteredZones",
        });
    });
});
