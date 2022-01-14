import React from "react";
import { View } from "deck.gl";
import { ViewProps } from "@deck.gl/core/views/view";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ViewFix extends React.Component<ViewProps> {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DeckGLView = View as any as {
    new (): ViewFix;
};
