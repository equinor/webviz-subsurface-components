import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React, { ChangeEvent } from "react";
import { Wrapper } from "../../test/TestWrapper";
import NumericInput from "./NumericInput";

describe("Test Numeric Input", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: (
                    <NumericInput
                        label="Trajectory thickness"
                        value={15}
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
