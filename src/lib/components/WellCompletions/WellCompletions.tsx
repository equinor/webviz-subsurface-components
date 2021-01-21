import PropTypes from "prop-types";
import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import DataLoader from "./components/DataLoader";
import WellCompletionsViewer from "./components/WellCompletionsViewer";
import { REDUX_STORE } from "./redux/store";
export interface ComponentProps {
    id: string;
    data: any;
}
const WellCompletions: React.FC<ComponentProps> = React.memo(props => {
    return (
        <ReduxProvider store={REDUX_STORE}>
            <DataLoader props={props}>
                <WellCompletionsViewer />
            </DataLoader>
        </ReduxProvider>
    );
});

WellCompletions.displayName = "WellCompletions";
WellCompletions.propTypes = {
    id: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
};
export default WellCompletions;
