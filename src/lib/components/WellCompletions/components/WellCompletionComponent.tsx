import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { REDUX_STORE } from "../redux/store";
import DataLoader from "./DataLoader";
import WellCompletionsViewer from "./WellCompletionsViewer";
interface Props {
    id: string;
}

const WellCompletionComponent: React.FC<Props> = React.memo(({ id }: Props) => {
    return (
        <ReduxProvider store={REDUX_STORE}>
            <DataLoader id={id}>
                <WellCompletionsViewer />
            </DataLoader>
        </ReduxProvider>
    );
});

WellCompletionComponent.displayName = "WellCompletionComponent";
export default WellCompletionComponent;
