import React, { Fragment, PropsWithChildren, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateData, updateId, updateTimeIndexRange } from "../redux/reducer";
import { ComponentProps } from "../WellCompletions";

interface Props {
    props: ComponentProps;
}

const DataLoader: React.FC<Props> = ({
    children,
    props,
}: PropsWithChildren<Props>) => {
    // Redux
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(updateId(props.id));
        dispatch(updateData(props.data));
        //Setup initial ui settings
        dispatch(
            updateTimeIndexRange(
                props.data.timeSteps.length > 0
                    ? [0, props.data.timeSteps.length - 1]
                    : [0, 0]
            )
        );
    }, [props]);

    return <Fragment>{children}</Fragment>;
};

export default DataLoader;
