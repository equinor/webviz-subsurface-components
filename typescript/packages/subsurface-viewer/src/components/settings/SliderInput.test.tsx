import { render } from "@testing-library/react";
import "jest-styled-components";
import "@testing-library/jest-dom";
import React, { FormEvent } from "react";
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
                            e;
                        }}
                    />
                ),
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
});
