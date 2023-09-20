import type { PropsWithChildren } from "react";
import React from "react";
/**
 * A tooltip provider for React components.
 *
 * Children of this provider can use the hook useTooltip to
 * access setContent method which accepts a React component
 * that will be displayed in the tooltip. Hiding the tooltip is
 * done with setContent(null)
 */
declare const TooltipProvider: React.FC<PropsWithChildren<unknown>>;
/**
 *  A hook for displaying tooltips
 */
declare const useTooltip: () => {
    setContent: React.Dispatch<React.SetStateAction<React.FC | null>>;
};
export { TooltipProvider, useTooltip };
