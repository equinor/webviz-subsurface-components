import React, { PropsWithChildren } from "react";
import ReactTooltip from "react-tooltip";

const TooltipContext = React.createContext<{
    setContent: React.Dispatch<React.SetStateAction<React.FC | null>>;
}>({
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
const TooltipProvider: React.FC<PropsWithChildren<unknown>> = ({
    children,
}: PropsWithChildren<unknown>) => {
    // State
    const [Content, setContent] = React.useState<React.FC | null>(null);

    const value = React.useMemo(
        () => ({
            setContent,
        }),
        [setContent]
    );

    return (
        <TooltipContext.Provider value={value}>
            {children}
            <ReactTooltip id="plot-tooltip" getContent={() => Content} />
        </TooltipContext.Provider>
    );
};

/**
 *  A hook for displaying tooltips
 */
const useTooltip = (): {
    setContent: React.Dispatch<React.SetStateAction<React.FC | null>>;
} => {
    return React.useContext(TooltipContext);
};

export { TooltipProvider, useTooltip };
