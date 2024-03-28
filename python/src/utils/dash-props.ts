export type DashComponentProps = {
    /**
     * Unique ID to identify this component in Dash callbacks.
     */
    id?: string;
    /**
     * Update props to trigger callbacks.
     */
    setProps: (props: Record<string, unknown>) => void;
};
