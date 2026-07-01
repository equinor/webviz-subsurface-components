import React, { type FormEvent } from "react";

import "jest";
import { describe, expect, it } from "@jest/globals";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import "jest-styled-components";

import { EmptyWrapper } from "../../test/TestWrapper";
import SliderInput from "./SliderInput";

describe("Test SliderInput", () => {
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
