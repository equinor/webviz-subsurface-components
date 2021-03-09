/* eslint-disable prettier/prettier */
import React, {
    Fragment,
    PropsWithChildren,
    useContext,
    useEffect
} from "react";
import { useDispatch } from "react-redux";
import {
    SORT_BY_COMPLETION_DATE,
    SORT_BY_NAME,
    SORT_BY_STRATIGRAPHY_DEPTH
} from "../hooks/sort";
import {
    updateAttributeKeys,
    updateFilteredZones,
    updateId,
    updateTimeIndexRange
} from "../redux/reducer";
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
        const attributeKeys = new Set<string>([
            SORT_BY_NAME,
            SORT_BY_STRATIGRAPHY_DEPTH,
            SORT_BY_COMPLETION_DATE,
        ]);
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
