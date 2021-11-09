import React from "react";
import DeckGLMap from "../DeckGLMap";

const exampleData = require("../../../../demo/example-data/deckgl-map.json");
const colorTemplate = require("../../../../demo/example-data/wellayer_template.json");
const colorTables = require("../../../../demo/example-data/color-tables.json");

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
            colorTemplate={colorTemplate}
            colorTables={colorTables}
        />
    );
};

export const Default = Template.bind({});
Default.args = exampleData[0];

export const templateData = Template.bind({});
templateData.args = { template: colorTemplate, colorTables: colorTables };
