import React, { useEffect } from "react";

import type { TooltipProps as MuiTooltipProps } from "@mui/material";
import {
    Box,
    // eslint-disable-next-line no-restricted-imports
    Tab,
    // eslint-disable-next-line no-restricted-imports
    Tabs as MUITabs,
    Tooltip as MuiToolTip,
    Typography,
    tabsClasses,
} from "@mui/material";

/**
 * Remove spaces and set to lower case.
 * Note that we cannot use replaceAll function
 * below until we move to ES2021.
 */
const buildId = (id: string): string => {
    return id.replace(/ /g, "").toLowerCase();
};

type TooltipProps = Pick<
    MuiTooltipProps,
    "children" | "title" | "placement" | "id" | "followCursor"
> & { disable?: boolean; fullWidth?: boolean };

const Tooltip: React.FC<TooltipProps> = (props) => {
    const { children, disable = false, ...rest } = props;
    const childrenWrapper = disable ? <span>{children}</span> : children;
    const ref = React.useRef<HTMLDivElement>();
    const childrenElement = React.cloneElement(childrenWrapper, { ref: ref });
    const [skipTooltip, setSkipTooltip] = React.useState(false);
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        // If a tooltip is placed on an element that could potentially overflow and is truncated with ellipsis,
        // we only show the tooltip in the case where the element is actually overflowing
        const textNode = ref.current as HTMLElement;
        if (
            textNode &&
            textNode.clientWidth >= textNode.scrollWidth &&
            textNode.clientWidth > 0 &&
            textNode.innerText === props.title
        ) {
            setSkipTooltip(true);
        }
    }, [props.title, ref, childrenElement]);

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, []);

    const handleOpen = React.useCallback(() => {
        setOpen(true);
    }, []);

    if (skipTooltip) {
        return childrenElement;
    }

    return (
        <MuiToolTip
            placement={props.placement ?? "top-start"}
            enterDelay={500}
            open={open && !disable}
            onClose={handleClose}
            onOpen={handleOpen}
            disableFocusListener={disable}
            disableHoverListener={disable}
            disableTouchListener={disable}
            arrow
            {...rest}
        >
            {childrenElement}
        </MuiToolTip>
    );
};

/**
 * Defines the content of a Tab title
 * @param label: the tab title
 * @param data-tut: optional flag for guided-tour usage (see UserAssistance component)
 * @param attention: optional flag to highlight this tab
 * @param decoration: optional element to add on the right of the tab panel
 * @param tooltip: optional tooltip
 */
type TabTitle = {
    label: string;
    "data-tut"?: string;
    attention?: boolean;
    decoration?: JSX.Element;
    tooltip?: string;
};

/**
 * Defines the properties of the Tabs Bar component
 * @param currentTab: defines the selected Tab
 * @param name: defines the component name
 * @param onTabChange: function called when the value of the selected tab has changed
 * @param titles: describes the Tabs of the component
 */
type TabsBarProps = {
    currentTab: number;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    onTabChange: (e: React.ChangeEvent<{}>, newValue: number) => void;
    titles: TabTitle[];
};

/**
 * Convenient component to gather and control a list of Tabs
 * @param props the component properties
 * @returns the created TabsBar component
 */
const TabsBar: React.FC<TabsBarProps> = (props) => {
    if (props.titles.length === 0) {
        return null;
    }

    const tabs = props.titles.map((title, index) => (
        <Tooltip key={title.label} title={title.tooltip ?? ""}>
            <Tab
                label={
                    <Box
                        data-tut={title["data-tut"]}
                        id={`${props.name}-tablabel-${index}`}
                    >
                        <Typography
                            variant="body2" // TODO: should be changed to h5 when removing the (v1.5) theme
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: (theme) => theme.spacing(0.5),
                            }}
                        >
                            {title.label}
                        </Typography>
                        {title.decoration}
                    </Box>
                }
                {...accessibilityProps(index, props.name)}
                wrapped
            />
        </Tooltip>
    ));

    return (
        <MUITabs
            value={props.currentTab}
            onChange={props.onTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label={`${props.name}-tabs`}
            sx={{
                [`& .${tabsClasses.scrollButtons}`]: {
                    "&.Mui-disabled": { opacity: 0.3 },
                },
            }}
        >
            {tabs}
        </MUITabs>
    );
};

/**
 * Convenient function to accessibility properties of a controlled Tab
 * by a TabsBar component.
 * @param index the Tab index in the TabsBar component
 * @param name the Tab name
 * @returns the Tab accessibility properties
 */
const accessibilityProps = (
    index: number,
    name: string
): { id: string; "aria-controls": string } => {
    return {
        id: `${name}-tab-${index}`,
        "aria-controls": `${name}-tabpanel-${index}`,
    };
};

/**
 * Defines the properties of the TabPanel component
 * @param name: the name of the TabPanel.
 * @param display: if true, the panel will be visible. Hidden otherwise.
 * @param customClassName: optional class name to control the component style.
 * @param children: optional children.
 */
type TabPanelProps = {
    name: string;
    display: boolean;
    customClassName?: string;
    children?: React.ReactNode;
};

/**
 * Convenient component to define a Tab panel which visibility is controlled by
 * a prop. Mainly designed for an association with the TabsBar component that will
 * control the visibility of a list of Tab panels in function of the selected tab.
 * @param props the component properties
 * @returns the created TabPanel component
 */
const TabPanel: React.FC<TabPanelProps> = (props) => {
    return (
        <div
            role="tabpanel"
            hidden={!props.display}
            id={`${buildId(props.name)}-tabpanel`}
            data-testid={`${buildId(props.name)}-tabpanel`}
            aria-labelledby={`${buildId(props.name)}-tab`}
        >
            {props.children}
        </div>
    );
};

/**
 * Defines a tab and its associated panel
 * @param title the tab title
 * @param panelContent defines the content of the tab panel
 * @param panelCustomClassName optional class name to control the tab panel style
 */
export type TabItem = {
    title: TabTitle;
    panelContent: JSX.Element;
    panelCustomClassName?: string;
};

/**
 * Defines the properties of the Tabs component
 * @param name the collection name. It will be used to tag the tab and panel
 * components contained in the collection
 * @param tabs defines the list of tabs and their panel contained in this collection
 * @param width defines the width of a collection inside a group.
 * @param selectedTab option number stating the tab that will be selected on build,
 * default is 0.
 * @param handleSelectedTab function that is called when new tab is selected.
 * @param groupIndex is the index of the current collection inside a group.
 */
type TabsProps = {
    name: string;
    tabs: TabItem[];
    width?: string | number;
    selectedTab?: number;
    handleSelectedTab?: (newSelectedTab: number) => void;
};

/**
 * Builds a tab panel
 * @param props: props of the panel to create.
 * @returns the created panel.
 */
const BuildTabPanel: React.FC<TabPanelProps> = React.memo((props) => {
    return (
        <TabPanel
            key={`${buildId(props.name)}-panel`}
            name={props.name}
            display={props.display}
            customClassName={props.customClassName}
        >
            {props.children}
        </TabPanel>
    );
});

BuildTabPanel.displayName = "BuildTabPanel";

/**
 * A convenient component to build a collection of tabs and their associated panels
 * @param props the component properties
 * @returns the created component or null if the props tabs array is empty
 */
export const Tabs: React.FC<TabsProps> = (props) => {
    const [currentTab, setCurrentTab] = React.useState(
        props.selectedTab ? props.selectedTab : 0
    );

    useEffect(() => {
        setCurrentTab(props.selectedTab ? props.selectedTab : 0);
    }, [props]);

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    const handleChange = (_e: React.ChangeEvent<{}>, newValue: number) => {
        setCurrentTab(newValue);
        if (props.handleSelectedTab) {
            props.handleSelectedTab(newValue);
        }
    };

    if (props.tabs.length === 0) {
        return null;
    }

    return (
        <Box style={props.width ? { width: props.width } : undefined}>
            <TabsBar
                name={props.name}
                currentTab={currentTab}
                onTabChange={handleChange}
                titles={props.tabs.map((tab) => tab.title)}
            />
            {props.tabs.map((tab, index) => (
                <BuildTabPanel
                    key={`${buildId(tab.title.label)}-panel`}
                    display={index === currentTab}
                    name={tab.title.label}
                    customClassName={tab.panelCustomClassName}
                >
                    {tab.panelContent}
                </BuildTabPanel>
            ))}
        </Box>
    );
};

export default Tabs;
