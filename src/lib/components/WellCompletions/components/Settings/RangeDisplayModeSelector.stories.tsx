import { withKnobs } from "@storybook/addon-knobs";
import { storiesOf } from "@storybook/react";
import React from "react";
import RangeDisplayModeSelector from "./RangeDisplayModeSelector";

storiesOf("forms/Boolean Setter", module)
    .addDecorator(withKnobs)
    .addDecorator(storyFn => (
        <div
            style={{
                textAlign: "center",
                border: "1px solid red",
                borderRadius: 5,
                width: 400,
            }}
        >
            {storyFn()}
        </div>
    ))
    .add("default", () => {
        return <RangeDisplayModeSelector />;
    });
