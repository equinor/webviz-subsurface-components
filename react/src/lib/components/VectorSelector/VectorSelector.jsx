import PropTypes from "prop-types";
import React from "react";
import VectorSelectorComponent from "./components/VectorSelectorComponent";

const VectorSelector = (props) => {
    return (
        <VectorSelectorComponent
            id={props.id}
            maxNumSelectedNodes={props.maxNumSelectedNodes}
            delimiter={props.delimiter}
            numMetaNodes={props.numMetaNodes}
            data={props.data}
            label={props.label}
            showSuggestions={props.showSuggestions}
            setProps={props.setProps}
            selectedTags={props.selectedTags}
            placeholder={props.placeholder}
            numSecondsUntilSuggestionsAreShown={
                props.numSecondsUntilSuggestionsAreShown
            }
            lineBreakAfterTag={props.lineBreakAfterTag}
            persistence={props.persistence}
        />
    );
};

VectorSelector.defaultProps = {
    maxNumSelectedNodes: -1,
    delimiter: ":",
    numMetaNodes: 0,
    showSuggestions: true,
    selectedTags: [],
    placeholder: "Add new tag...",
    numSecondsUntilSuggestionsAreShown: 0.5,
    lineBreakAfterTag: false,
    persisted_props: ["selectedNodes", "selectedTags", "selectedIds"],
    persistence_type: "local",
};

VectorSelector.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string.isRequired,

    /**
     * The max number of tags that can be selected.
     */
    maxNumSelectedNodes: PropTypes.number,

    /**
     * The delimiter used to separate input levels.
     */
    delimiter: PropTypes.string,

    /**
     * The number of meta data used. Meta data is not shown as text in the final tag but used
     * to set properties like border color or icons.
     */
    numMetaNodes: PropTypes.number,

    /**
     * A JSON object holding all tags.
     */
    data: PropTypes.array.isRequired,

    /**
     * A label that will be printed when this component is rendered.
     */
    label: PropTypes.string,

    /**
     * Stating of suggestions should be shown or not.
     */
    showSuggestions: PropTypes.bool,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func,

    /**
     * Selected tags.
     */
    selectedTags: PropTypes.arrayOf(PropTypes.string),

    /**
     * Placeholder text for input field.
     */
    placeholder: PropTypes.string,

    /**
     * Number of seconds until suggestions are shown.
     */
    numSecondsUntilSuggestionsAreShown: PropTypes.number,

    /**
     * If set to true, tags will be separated by a line break.
     */
    lineBreakAfterTag: PropTypes.bool,

    /**
     * Used to allow user interactions in this component to be persisted when
     * the component - or the page - is refreshed. If `persisted` is truthy and
     * hasn't changed from its previous value, a `value` that the user has
     * changed while using the app will keep that change, as long as
     * the new `value` also matches what was given originally.
     * Used in conjunction with `persistence_type`.
     */
    persistence: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string,
        PropTypes.number,
    ]),

    /**
     * Properties whose user interactions will persist after refreshing the
     * component or the page. Since only `value` is allowed this prop can
     * normally be ignored.
     */
    persisted_props: PropTypes.arrayOf(
        PropTypes.oneOf(["selectedNodes", "selectedTags", "selectedIds"])
    ),

    /**
     * Where persisted user changes will be stored:
     * memory: only kept in memory, reset on page refresh.
     * local: window.localStorage, data is kept after the browser quit.
     * session: window.sessionStorage, data is cleared once the browser quit.
     */
    persistence_type: PropTypes.oneOf(["local", "session", "memory"]),
};

export default VectorSelector;
