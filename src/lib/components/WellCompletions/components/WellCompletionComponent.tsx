import React from "react";
import DataProvider from "./DataLoader";
import WellCompletionsViewer from "./WellCompletionsViewer";
interface Props {
    id: string;
    data: any;
}

const WellCompletionComponent: React.FC<Props> = React.memo(
    ({ id, data }: Props) => {
        return (
            <DataProvider id={id} data={data}>
                <WellCompletionsViewer />
            </DataProvider>
        );
    }
);

WellCompletionComponent.displayName = "WellCompletionComponent";
export default WellCompletionComponent;
