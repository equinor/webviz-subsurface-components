import React, { type ChangeEvent } from "react";

import "jest";
import { describe, expect, it } from "@jest/globals";

import { render } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";
import "jest-styled-components";

import { EmptyWrapper } from "../../test/TestWrapper";
import ToggleButton from "./ToggleButton";

describe("Test ToggleButton", () => {
    it("snapshot test", () => {
        const { container } = render(
            EmptyWrapper({
                children: (
                    <ToggleButton
                        label="Log curves"
                        checked={false}
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
