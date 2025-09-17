import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";
import React, { useState } from "react";

import type { CallbackManager } from "./CallbackManager";
import WellLogScaleSelector from "./WellLogScaleSelector";

/** Mock CallbackManager for Storybook */
class MockCallbackManager {
    controller = {
        setContentScale: (value: number): void => {
            console.log("Scale set to:", value);
        },
        getContentScale: (): number => {
            return 1.0;
        },
    };
    private callbacks: Map<string, (() => void)[]> = new Map();

    registerCallback(eventName: string, callback: () => void): void {
        if (!this.callbacks.has(eventName)) {
            this.callbacks.set(eventName, []);
        }
        this.callbacks.get(eventName)?.push(callback);
    }

    unregisterCallback(eventName: string, callback: () => void): void {
        const callbacks = this.callbacks.get(eventName);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    triggerCallback(eventName: string): void {
        const callbacks = this.callbacks.get(eventName);
        if (callbacks) {
            callbacks.forEach((callback) => callback());
        }
    }
}

const stories: Meta = {
    component: WellLogScaleSelector,
    title: "WellLogViewer/Components/WellLogScaleSelector",
    tags: ["no-screenshot-test"],
    parameters: {
        docs: {
            description: {
                component:
                    "A scale selector component for WellLogViewer that allows users to change the content scale/zoom level. Integrates with CallbackManager to communicate scale changes.",
            },
        },
    },
    argTypes: {
        callbackManager: {
            description: "CallbackManager instance to handle scale changes",
            control: false,
        },
        label: {
            description: "Label to display next to the scale selector",
            control: { type: "text" },
        },
        values: {
            description: "Available scale values array",
            control: { type: "object" },
        },
        round: {
            description:
                'Round the value to a "good" number (true for auto or number for rounding step)',
            control: { type: "boolean" },
        },
    },
};

export default stories;

interface TemplateProps {
    label?: string | JSX.Element;
    values?: number[];
    round?: boolean | number;
}

const Template = (args: TemplateProps) => {
    const [mockManager] = useState(() => new MockCallbackManager());
    const [info, setInfo] = useState("Current scale: 1.0");
    const [currentScaleIndex, setCurrentScaleIndex] = useState(0);

    // Default scale values to cycle through
    const defaultScaleValues = [0.5, 1, 2, 4, 8];

    // Create a wrapper that updates our info display
    React.useEffect(() => {
        const originalSetScale = mockManager.controller.setContentScale;
        mockManager.controller.setContentScale = function (value: number) {
            originalSetScale.call(this, value);
            setInfo(`Current scale: ${value}`);
        };
    }, [mockManager]);

    const handleExternalScaleChange = () => {
        const scaleValues = args.values || defaultScaleValues;
        const nextIndex = (currentScaleIndex + 1) % scaleValues.length;
        const newScale = scaleValues[nextIndex];

        // Update the mock's internal scale
        mockManager.controller.getContentScale = () => newScale;
        mockManager.controller.setContentScale(newScale);

        // Trigger the callback to notify the component
        mockManager.triggerCallback("onContentRescale");

        setCurrentScaleIndex(nextIndex);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <div style={{ marginBottom: "10px" }}>
                <WellLogScaleSelector
                    callbackManager={mockManager as unknown as CallbackManager}
                    label={args.label}
                    values={args.values}
                    round={args.round}
                />
            </div>
            <div
                style={{
                    padding: "10px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#666",
                }}
            >
                {info}
            </div>
            <div style={{ marginTop: "20px" }}>
                <button
                    onClick={handleExternalScaleChange}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#007acc",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    Simulate External Scale Change
                </button>
            </div>
        </div>
    );
};

export const Default: StoryObj<typeof Template> = {
    args: {
        label: "Zoom Level:",
        round: true,
    },
    render: (args) => <Template {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Wait for component to render
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Test external scale change button
        const externalButton = canvas.getByText(
            "Simulate External Scale Change"
        );
        await userEvent.click(externalButton);

        // Check that the info display updated
        await expect(
            canvas.getByText(/Current scale: 0\.5/)
        ).toBeInTheDocument();

        // Click again to cycle to next value
        await userEvent.click(externalButton);
        await expect(canvas.getByText(/Current scale: 2/)).toBeInTheDocument();
    },
};

export const WithJSXLabel: StoryObj<typeof Template> = {
    args: {
        label: <strong style={{ color: "#007acc" }}>Custom Scale:</strong>,
        round: true,
    },
    render: (args) => <Template {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Verify the custom JSX label is rendered
        await expect(canvas.getByText("Custom Scale:")).toBeInTheDocument();

        // Test interaction
        const externalButton = canvas.getByText(
            "Simulate External Scale Change"
        );
        await userEvent.click(externalButton);
        await expect(
            canvas.getByText(/Current scale: 0\.5/)
        ).toBeInTheDocument();
    },
};

export const WithCustomValues: StoryObj<typeof Template> = {
    args: {
        label: "Scale:",
        values: [0.5, 1, 2, 4, 8, 16, 32],
        round: false,
    },
    render: (args) => <Template {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Test cycling through custom values
        const externalButton = canvas.getByText(
            "Simulate External Scale Change"
        );

        // Start at scale 1, click to go to next value (2)
        await userEvent.click(externalButton);
        await expect(canvas.getByText(/Current scale: 2/)).toBeInTheDocument();

        // Click again to go to next value (4)
        await userEvent.click(externalButton);
        await expect(canvas.getByText(/Current scale: 4/)).toBeInTheDocument();

        // Click multiple times to test cycling back to beginning
        for (let i = 0; i < 5; i++) {
            await userEvent.click(externalButton);
        }
        await expect(
            canvas.getByText(/Current scale: 0\.5/)
        ).toBeInTheDocument();
    },
};

export const WithoutLabel: StoryObj<typeof Template> = {
    args: {
        round: true,
    },
    render: (args) => <Template {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Test that the component works without a label
        const externalButton = canvas.getByText(
            "Simulate External Scale Change"
        );
        await userEvent.click(externalButton);
        await expect(
            canvas.getByText(/Current scale: 0\.5/)
        ).toBeInTheDocument();
    },
};

export const WithRoundingStep: StoryObj<typeof Template> = {
    args: {
        label: "Scale:",
        round: 0.1, // Round to nearest 0.1
        values: [0.01, 0.11, 0.12, 100.01],
    },
    render: (args) => <Template {...args} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Test rounding behavior with custom values
        const externalButton = canvas.getByText(
            "Simulate External Scale Change"
        );

        // Click to cycle through values and verify they appear
        await userEvent.click(externalButton);
        await expect(
            canvas.getByText(/Current scale: 0\.11/)
        ).toBeInTheDocument();

        await userEvent.click(externalButton);
        await expect(
            canvas.getByText(/Current scale: 0\.12/)
        ).toBeInTheDocument();

        await userEvent.click(externalButton);
        await expect(
            canvas.getByText(/Current scale: 100\.01/)
        ).toBeInTheDocument();
    },
};
