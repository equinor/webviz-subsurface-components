import React, { Fragment, PropsWithChildren, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateTimeIndexRange, updateTimesArray } from "../redux/reducer";
import { DataInput } from "../redux/types";

interface Props {
    data: DataInput;
}

const DataLoader: React.FC<Props> = ({
    children,
    data,
}: PropsWithChildren<Props>) => {
    // Redux
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(updateTimesArray(data.time_steps));
        dispatch(
            updateTimeIndexRange(
                data.time_steps.length > 0
                    ? [0, data.time_steps.length - 1]
                    : [-1, -1]
            )
        );
    }, [data]);

    return <Fragment>{children}</Fragment>;
};

export default DataLoader;
