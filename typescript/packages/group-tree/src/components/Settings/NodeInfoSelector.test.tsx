import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "jest-styled-components";
import React from "react";
import { testStore, Wrapper } from "../../test/TestWrapper";
import NodeInfoSelector from "./NodeInfoSelector";

const node_options = [
    { name: "pressure", label: "Pressure" },
    { name: "bhp", label: "Bottom Hole Pressure" },
];

describe("Test flow rate selector component", () => {
    it("snapshot test", () => {
        const { container } = render(
            Wrapper({
                children: <NodeInfoSelector node_options={node_options} />,
            })
        );
        expect(container.firstChild).toMatchSnapshot();
    });
    it("select 'Pressure' option to dispatch redux action", async () => {
        render(
            Wrapper({
                children: <NodeInfoSelector node_options={node_options} />,
            })
        );
        userEvent.selectOptions(
            screen.getByRole("combobox", { name: "Node Data" }),
            "pressure"
        );
        expect(testStore.dispatch).toHaveBeenCalledTimes(1);
        expect(testStore.dispatch).toHaveBeenCalledWith({
            payload: "pressure",
            type: "ui/updateCurrentNodeInfo",
        });
    });
});
