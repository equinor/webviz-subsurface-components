import {
    render,
    screen,
    waitForElementToBeRemoved,
} from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React from "react";
import InfoCard from "./InfoCard";
import userEvent from "@testing-library/user-event";

describe("Test Info Card", () => {
    it("snapshot test with no props", () => {
        const { container } = render(
            <InfoCard
                pickInfos={[
                    {
                        x: 152,
                        y: 254,
                        // @ts-expect-error: to be fixed
                        radius: 1,
                        depth: 638,
                        coordinate: [111, 222],
                    },
                    {
                        // @ts-expect-error: to be fixed
                        layer: { id: "wells-layer" },
                        property: { name: "Poro WellA", value: 123 },
                    },
                ]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("collapse infocard", async () => {
        render(
            <InfoCard
                pickInfos={[
                    {
                        x: 152,
                        y: 254,
                        // @ts-expect-error: to be fixed
                        radius: 1,
                        depth: 638,
                        coordinate: [111, 222],
                    },
                ]}
            />
        );
        const collapse_button = screen.getByRole("button", { name: "" });
        expect(screen.getByText("111")).toBeVisible();
        userEvent.click(collapse_button);
        await waitForElementToBeRemoved(() => screen.getByText("111"));
    });
    it("undefined coordinates", async () => {
        const { container } = render(
            <InfoCard
                pickInfos={[
                    {
                        x: 152,
                        y: 254,
                        // @ts-expect-error: to be fixed
                        radius: 1,
                        depth: 638,
                        coordinate: undefined,
                    },
                ]}
            />
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
