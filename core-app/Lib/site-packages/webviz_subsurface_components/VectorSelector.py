# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class VectorSelector(Component):
    """A VectorSelector component.


Keyword arguments:

- id (string; required):
    The ID used to identify this component in Dash callbacks.

- caseInsensitiveMatching (boolean; optional):
    Set to True if case-wise incorrect values should be accepted
    anyways.

- customVectorDefinitions (dict; optional):
    An object containing custom vector type definitions.

    `customVectorDefinitions` is a dict with strings as keys and
    values of type dict with keys:

    - type (string; required)

    - description (string; required)

- data (list; required):
    A JSON object holding all tags.

- delimiter (string; default ":"):
    The delimiter used to separate input levels.

- label (string; optional):
    A label that will be printed when this component is rendered.

- lineBreakAfterTag (boolean; default False):
    If set to True, tags will be separated by a line break.

- maxNumSelectedNodes (number; default -1):
    The max number of tags that can be selected.

- numMetaNodes (number; default 0):
    The number of meta data used. Meta data is not shown as text in
    the final tag but used to set properties like border color or
    icons.

- numSecondsUntilSuggestionsAreShown (number; default 0.5):
    Number of seconds until suggestions are shown.

- persisted_props (list of a value equal to: "selectedNodes", "selectedTags", "selectedIds"s; default ["selectedNodes", "selectedTags", "selectedIds"]):
    Properties whose user interactions will persist after refreshing
    the component or the page. Since only `value` is allowed this prop
    can normally be ignored.

- persistence (boolean | string | number; optional):
    Used to allow user interactions in this component to be persisted
    when the component - or the page - is refreshed. If `persisted` is
    truthy and hasn't changed from its previous value, a `value` that
    the user has changed while using the app will keep that change, as
    long as the new `value` also matches what was given originally.
    Used in conjunction with `persistence_type`.

- persistence_type (a value equal to: "local", "session", "memory"; default "local"):
    Where persisted user changes will be stored: memory: only kept in
    memory, reset on page refresh. local: window.localStorage, data is
    kept after the browser quit. session: window.sessionStorage, data
    is cleared once the browser quit.

- placeholder (string; default "Add new tag..."):
    Placeholder text for input field.

- selectedTags (list of strings; optional):
    Selected tags.

- showSuggestions (boolean; default True):
    Stating of suggestions should be shown or not.

- useBetaFeatures (boolean; optional):
    Set to True to enable beta features."""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'webviz_subsurface_components'
    _type = 'VectorSelector'
    @_explicitize_args
    def __init__(self, id=Component.REQUIRED, maxNumSelectedNodes=Component.UNDEFINED, delimiter=Component.UNDEFINED, numMetaNodes=Component.UNDEFINED, data=Component.REQUIRED, label=Component.UNDEFINED, showSuggestions=Component.UNDEFINED, selectedTags=Component.UNDEFINED, placeholder=Component.UNDEFINED, numSecondsUntilSuggestionsAreShown=Component.UNDEFINED, lineBreakAfterTag=Component.UNDEFINED, caseInsensitiveMatching=Component.UNDEFINED, useBetaFeatures=Component.UNDEFINED, customVectorDefinitions=Component.UNDEFINED, persistence=Component.UNDEFINED, persisted_props=Component.UNDEFINED, persistence_type=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'caseInsensitiveMatching', 'customVectorDefinitions', 'data', 'delimiter', 'label', 'lineBreakAfterTag', 'maxNumSelectedNodes', 'numMetaNodes', 'numSecondsUntilSuggestionsAreShown', 'persisted_props', 'persistence', 'persistence_type', 'placeholder', 'selectedTags', 'showSuggestions', 'useBetaFeatures']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'caseInsensitiveMatching', 'customVectorDefinitions', 'data', 'delimiter', 'label', 'lineBreakAfterTag', 'maxNumSelectedNodes', 'numMetaNodes', 'numSecondsUntilSuggestionsAreShown', 'persisted_props', 'persistence', 'persistence_type', 'placeholder', 'selectedTags', 'showSuggestions', 'useBetaFeatures']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        for k in ['id', 'data']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')

        super(VectorSelector, self).__init__(**args)
