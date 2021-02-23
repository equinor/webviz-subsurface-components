import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React, { PropsWithChildren } from "react";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            position: "fixed",
            zIndex: 999,
            padding: theme.spacing(0.5),
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.divider,
            borderRadius: theme.shape.borderRadius,
            borderWidth: "thin",
            borderStyle: "solid",
            pointerEvents: "none",
            overflow: "hidden",
        },
    })
);

const TooltipContext = React.createContext<{
    setContent: React.Dispatch<React.SetStateAction<React.FC<{}> | null>>;
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
const TooltipProvider: React.FC<PropsWithChildren<{}>> = ({
    children,
}: PropsWithChildren<{}>) => {
    // Style
    const classes = useStyles();

    // State
    const [coords, setCoords] = React.useState([0, 0]);
    const [Content, setContent] = React.useState<React.FC | null>(null);

    const value = React.useMemo(
        () => ({
            setContent,
        }),
        [setContent]
    );

    // Callbacks
    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        setCoords([e.clientX, e.clientY]);
    }, []);

    const addEventListeners = React.useCallback(() => {
        document.addEventListener("mousemove", handleMouseMove);
    }, [handleMouseMove]);

    const removeEventListeners = React.useCallback(() => {
        document.removeEventListener("mousemove", handleMouseMove);
    }, [handleMouseMove]);

    // Effects
    React.useEffect(() => {
        addEventListeners();
        return removeEventListeners;
    }, [addEventListeners, removeEventListeners]);

    return (
        <TooltipContext.Provider value={value}>
            {children}
            <div
                className={classes.root}
                style={{
                    left: coords[0] + 20, // 20px x offset from the mouse cursor
                    top: coords[1],
                    display: Content ? undefined : "none",
                }}
            >
                {Content}
            </div>
        </TooltipContext.Provider>
    );
};

/**
 *  A hook for displaying tooltips
 */
const useTooltip = () => {
    return React.useContext(TooltipContext);
};

export { TooltipProvider, useTooltip };

