import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React, { ChangeEvent } from "react";
import { Wrapper } from "../../test/TestWrapper";
import ToggleButton from "./ToggleButton";

describe("Test Toggle Input", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <ToggleButton
                        label="Log curves"
                        checked={false}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            e;
                        }}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
