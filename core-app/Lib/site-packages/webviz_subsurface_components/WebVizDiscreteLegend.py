# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class WebVizDiscreteLegend(Component):
    """A WebVizDiscreteLegend component.


Keyword arguments:

- colorName (string; default PropTypes.string.isRequired)

- colorTables (string; default PropTypes.oneOfType([PropTypes.string, PropTypes.array]))

- cssLegendStyles (dict; default PropTypes.objectOf(PropTypes.string))

    `cssLegendStyles` is a dict with strings as keys and values of
    type dict with keys:


- discreteData (dict; default PropTypes.any.isRequired)

    `discreteData` is a dict with keys:

    - objects (dict with strings as keys and values of type list of list of numberss; required)

- horizontal (boolean; default PropTypes.bool)

- title (string; default PropTypes.string)"""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'webviz_subsurface_components'
    _type = 'WebVizDiscreteLegend'
    @_explicitize_args
    def __init__(self, discreteData=Component.UNDEFINED, title=Component.UNDEFINED, cssLegendStyles=Component.UNDEFINED, colorName=Component.UNDEFINED, colorTables=Component.UNDEFINED, horizontal=Component.UNDEFINED, **kwargs):
        self._prop_names = ['colorName', 'colorTables', 'cssLegendStyles', 'discreteData', 'horizontal', 'title']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['colorName', 'colorTables', 'cssLegendStyles', 'discreteData', 'horizontal', 'title']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(WebVizDiscreteLegend, self).__init__(**args)
