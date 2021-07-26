import { fireEvent, render, screen } from "@testing-library/react";
import "jest-styled-components";
import React from "react";
import userEvent from "@testing-library/user-event";
import { testStore, Wrapper } from "../../test/TestWrapper";
import LayersButton from "./LayersButton";

describe("test hide zero completions switch", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({ children: <LayersButton /> })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("click to dispatch redux action", async () => {
        const container = render(<LayersButton />, {
            wrapper: Wrapper,
        });
        userEvent.hover(screen.getByLabelText("layers-selector-button"));
        expect(await screen.findByText("Layers")).toBeInTheDocument();

        userEvent.click(screen.getByRole('button'))
        expect(screen.getByRole('menu')).toBeInTheDocument()
        userEvent.click(screen.getByRole('checkbox', {  name: /colormap\-layer/i}))
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toBeCalledWith({
            payload: ["colormap-layer", false],
            type: "spec/updateVisibleLayers",
        });

    });
});
