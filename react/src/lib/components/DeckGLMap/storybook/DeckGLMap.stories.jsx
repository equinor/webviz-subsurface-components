import React from "react";
import DeckGLMap from "../DeckGLMap";

const exampleData = require("../../../../demo/example-data/deckgl-map.json");

export default {
    component: DeckGLMap,
    title: "DeckGLMap",
};

const Template = (args) => {
    const [editedData, setEditedData] = React.useState(args.editedData);
    React.useEffect(() => {
        setEditedData(args.editedData);
    }, [args.editedData]);

    return (
        <DeckGLMap
            {...args}
            editedData={editedData}
            setProps={(updatedProps) => {
                setEditedData(updatedProps.editedData);
            }}
        />
    );
};

export const Default = Template.bind({});
Default.args = exampleData[0];
