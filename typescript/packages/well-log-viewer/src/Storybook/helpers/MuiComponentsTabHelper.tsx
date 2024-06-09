import React from "react";

import type { PayloadAction } from "@reduxjs/toolkit";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { Provider, useDispatch, useSelector } from "react-redux";

import type { GridDirection } from "@mui/material";
import { Grid } from "@mui/material";

import type { TabItem } from "./mui-components";
import { Tabs } from "./mui-components";

export interface ITabState {
    value: number;
}

const initialState: ITabState = {
    value: 0,
};

const tabSlices = createSlice({
    name: "tab",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState,
    reducers: {
        setTabValue: (state, action: PayloadAction<number>) => {
            state.value = action.payload;
        },
    },
});

const { setTabValue } = tabSlices.actions;
const getTabValue = (state: TRootState) => state.tab.value;

const store = configureStore({
    reducer: {
        tab: tabSlices.reducer,
    },
});
type TRootState = ReturnType<typeof store.getState>;
type TAppDispatch = typeof store.dispatch;

const renderTestComponent = (
    renderer: (ref: React.MutableRefObject<null>) => React.JSX.Element,
    ref: React.MutableRefObject<null>,
    selectedTabIndex: number
) => {
    // the test component is rendered on tab with index 1
    const testComponentTabIndex = 1;
    if (!ref.current && testComponentTabIndex !== selectedTabIndex) {
        return null;
    } else {
        return renderer(ref);
    }
};

const TestComponentArea: React.FC<React.PropsWithChildren> = ({ children }) => {
    //---------------------------------------------------------------------------------
    // The Page rendering
    //---------------------------------------------------------------------------------

    const direction: GridDirection = "column";

    const ref = React.useRef(null);

    const tab = useSelector(getTabValue);

    const renderer = (ref: React.MutableRefObject<null>): React.JSX.Element => {
        return <div ref={ref}> {children} </div>;
    };

    const testComponent = renderTestComponent(renderer, ref, tab);

    return (
        <div>
            <Grid container direction={direction} justifyContent="flex-start">
                <div>tab title</div>
                {testComponent}
            </Grid>
            <br />
        </div>
    );
};

const AppPage: React.FC<React.PropsWithChildren> = ({ children }) => {
    const renderTabs = (): TabItem[] => {
        const tabItems: TabItem[] = [];

        const renderEmptyTab = (): React.JSX.Element => {
            return <div>empty tab</div>;
        };

        const renderTestComponentTab = (): React.JSX.Element => {
            return <TestComponentArea>{children}</TestComponentArea>;
        };

        const EmptyTab1: TabItem = {
            title: { label: "tab 1" },
            panelContent: renderEmptyTab(),
        };
        tabItems.push(EmptyTab1);

        const logViewTab: TabItem = {
            title: { label: "tab 2" },
            panelContent: renderTestComponentTab(),
        };
        tabItems.push(logViewTab);

        const EmptyTab2: TabItem = {
            title: { label: "tab 3" },
            panelContent: renderEmptyTab(),
        };
        tabItems.push(EmptyTab2);

        return tabItems;
    };

    const dispatch = useDispatch<TAppDispatch>();

    return (
        <Tabs
            name={"blank"}
            tabs={renderTabs()}
            selectedTab={0}
            handleSelectedTab={(tab: number) => dispatch(setTabValue(tab))}
            width="100%"
        />
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const tabDecorator = (Story: any) => (
    <Provider store={store}>
        <AppPage>
            <Story />
        </AppPage>
    </Provider>
);
