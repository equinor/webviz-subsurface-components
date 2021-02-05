import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { REDUX_STORE } from "../redux/store";
import DataLoader from "./DataLoader";
import WellCompletionsViewer from "./WellCompletionsViewer";
export interface ComponentProps {
    id: string;
    data: any;
}
const WellCompletionComponent: React.FC<ComponentProps> = React.memo(props => {
    return (
        <ReduxProvider store={REDUX_STORE}>
            <DataLoader props={props}>
                <WellCompletionsViewer />
            </DataLoader>
        </ReduxProvider>
    );
});

WellCompletionComponent.displayName = "WellCompletionComponent";
export default WellCompletionComponent;
