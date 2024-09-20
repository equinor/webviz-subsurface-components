import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import type { ChangeEvent } from "react";
import React from "react";
import { EmptyWrapper } from "../../test/TestWrapper";
import NumericInput from "./NumericInput";

describe("Test Numeric Input", () => {
    it("snapshot test", () => {
        const { container } = render(
            EmptyWrapper({
                children: (
                    <NumericInput
                        label="Trajectory thickness"
                        value={15}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            // TODO: Fix this the next time the file is edited.
                            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                            e;
                        }}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
