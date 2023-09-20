import React from "react";
import ReactTooltip from "react-tooltip";
const TooltipContext = React.createContext({
    setContent: () => null,
});
/**
 * A tooltip provider for React components.
 *
 * Children of this provider can use the hook useTooltip to
 * access setContent method which accepts a React component
 * that will be displayed in the tooltip. Hiding the tooltip is
 * done with setContent(null)
 */
const TooltipProvider = ({ children, }) => {
    // State
    const [Content, setContent] = React.useState(null);
    const value = React.useMemo(() => ({
        setContent,
    }), [setContent]);
    return (React.createElement(TooltipContext.Provider, { value: value },
        children,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        React.createElement(ReactTooltip, { id: "plot-tooltip", getContent: () => Content })));
};
/**
 *  A hook for displaying tooltips
 */
const useTooltip = () => {
    return React.useContext(TooltipContext);
};
export { TooltipProvider, useTooltip };
//# sourceMappingURL=TooltipProvider.js.map