import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import type { FormEvent } from "react";
import React from "react";
import { EmptyWrapper } from "../../test/TestWrapper";
import SliderInput from "./SliderInput";

describe("Test Slider Input", () => {
    it("snapshot test", () => {
        const { container } = render(
            EmptyWrapper({
                children: (
                    <SliderInput
                        label="Opacity"
                        value={50}
                        min={0}
                        max={100}
                        step={2}
                        onChange={(e: FormEvent<HTMLDivElement>) => {
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
