import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent, screen , within, wait} from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import { Wrapper, testStore } from "../../test/TestWrapper";
import ZoneSelector from "./ZoneSelector";

describe("test Zone Selector", () => {
    it("snapshot test", () => {
        const { container } = render(Wrapper({ children: <ZoneSelector /> }));
        expect(container.firstChild).toMatchSnapshot();
    });

    it("click to dispatch redux action remove all zones", async () => {
        
        const { container } = render(<ZoneSelector />, {
             wrapper: Wrapper,
        });

        fireEvent.click(screen.getByRole('button', {  name: /remove all/i}))
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: [],
            type: "ui/updateFilteredZones",
        });
    });

    it("click to dispatch redux action to remove one zone", async () => {       
        const { container } = render(<ZoneSelector />, {
                 wrapper: Wrapper,
        });

        const zone_list = screen.getByText(/select zone\(s\)\.\.\./i)
        fireEvent.click(screen.getByText(/select zone\(s\)\.\.\./i))
        expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument()
 
    });
});

