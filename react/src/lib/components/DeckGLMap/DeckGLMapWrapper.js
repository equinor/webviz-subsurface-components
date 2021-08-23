import React from "react";
import DeckGLMap from "./DeckGLMap";

const DeckGLMapWrapper = (props) => {
    const [parsedJson, setParsedJson] = React.useState(null);
    React.useEffect(() => {
        setParsedJson(props);
    }, []);

    const setMapProps = React.useCallback((updatedProps) => {
        const updatedJson = {
            ...parsedJson,
            ...updatedProps,
        };
        setParsedJson(updatedJson);
    });

    return parsedJson && <DeckGLMap {...parsedJson} setProps={setMapProps} />;
};

export default DeckGLMapWrapper;
