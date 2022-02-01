import React from "react";
import Map from "../../components/Map";
import { Provider } from "react-redux";
import { createStore } from "../../redux/store";
import { getLayersWithDefaultProps } from "../../layers/utils/layerTools";

const exampleData = require("../../../../../demo/example-data/deckgl-map.json");
const layers = getLayersWithDefaultProps(exampleData[0].layers);
const views = exampleData[0].views;
const store = createStore({ layers: layers, views: views });

export default {
    component: Map,
    title: "DeckGLMap/Components/Map",
    decorators: [(story) => <Provider store={store}> {story()} </Provider>],
};

const Template = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);
    return (
        <Map
            {...args}
            editedData={editedData}
            setEditedData={(updatedProps) => {
                setEditedData(updatedProps.editedData);
            }}
        />
    );
};

export const Default = Template.bind({});
Default.args = {
    ...exampleData[0],
};
