import value from "*.glsl";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import ZoneSelector from "./ZoneSelector";


describe("test Zone Selector", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <ZoneSelector /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });

    it("click to dispatch redux action", async () => {
        const {container} = render(<ZoneSelector />, {
            wrapper: Wrapper,
        });
        userEvent.click(screen.getByRole('button', { name: "Select Zones ​" }))
        await screen.getByRole('listbox')

        //incomplete test
        /*
        const list = screen.getByRole('listbox')

        const { getByRole } = within(list)
        const items = getByRole("option", {name: 'zone1' , hidden: true})

        userEvent.click(screen.getByText('zone1'))
        */

        /*
        const list = screen.getByRole("listbox", {
            name: /Select Zones/i,})
            
        userEvent.selectOptions(list, ['zone1', 'zone2'])
        const { getAllByRole } = within(list)
        const items = getAllByRole('listbo')
        userEvent.click(items[0])
        */

        /*
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["zone1", "zone2"],
            type: "ui/updateFilteredZones",
        
        });
        */
    });
});

