import React, {
    Fragment,
    PropsWithChildren,
    useContext,
    // eslint-disable-next-line prettier/prettier
    useEffect
} from "react";
import { useDispatch } from "react-redux";
import {
    updateAttributeKeys,
    updateFilteredZones,
    updateId,
    // eslint-disable-next-line prettier/prettier
    updateTimeIndexRange
} from "../redux/reducer";
import { SORT_BY_NAME } from "../redux/types";
import { DataContext } from "../WellCompletions";

interface Props {
    id: string;
}

const DataLoader: React.FC<Props> = ({
    children,
    id,
}: PropsWithChildren<Props>) => {
    // Redux
    const dispatch = useDispatch();
    const data = useContext(DataContext);

    useEffect(() => {
        dispatch(updateId(id));
        //Setup attributes
        const attributeKeys = new Set<string>();
        attributeKeys.add(SORT_BY_NAME);
        data.wells.forEach(well =>
            Object.keys(well.attributes).forEach(key => attributeKeys.add(key))
        );
        dispatch(updateAttributeKeys(Array.from(attributeKeys)));
        //Setup initial ui settings
        dispatch(
            updateTimeIndexRange(
                data.timeSteps.length > 0
                    ? [0, data.timeSteps.length - 1]
                    : [0, 0]
            )
        );
        dispatch(updateFilteredZones(data.stratigraphy.map(zone => zone.name)));
    }, [data]);

    return <Fragment>{children}</Fragment>;
};

export default DataLoader;
