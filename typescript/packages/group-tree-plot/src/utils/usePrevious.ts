import React from "react";

export function usePrevious<T>(value: T): T | null {
    const oldValRef = React.useRef<T | null>(null);
    React.useEffect(() => {
        oldValRef.current = value;
    }, [value]);

    return oldValRef.current;
}
