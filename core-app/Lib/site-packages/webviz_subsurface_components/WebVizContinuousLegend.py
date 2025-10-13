# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class WebVizContinuousLegend(Component):
    """A WebVizContinuousLegend component.


Keyword arguments:

- id (string; default PropTypes.string)

- colorName (string; default PropTypes.string.isRequired)

- colorTables (list of dicts; default PropTypes.array)

    `colorTables` is a list of dicts with keys:

    - name (string; required)

    - discrete (boolean; required)

    - colors (list of list of 4 elements: [number, number, number, number]s; required)

    - description (string; optional)

    - colorNaN (list of 3 elements: [number, number, number]; optional)

    - colorBelow (list of 3 elements: [number, number, number]; optional)

    - colorAbove (list of 3 elements: [number, number, number]; optional)

- cssLegendStyles (dict; default PropTypes.objectOf(PropTypes.string))

    `cssLegendStyles` is a dict with strings as keys and values of
    type dict with keys:


- horizontal (boolean; default PropTypes.bool)

- isRangeShown (boolean; default PropTypes.bool)

- legendFontSize (number; default PropTypes.number)

- legendScaleSize (number; default PropTypes.number)

- max (number; default PropTypes.number.isRequired)

- min (number; default PropTypes.number.isRequired)

- numberOfTicks (number; default PropTypes.number)

- tickFontSize (number; default PropTypes.number)

- title (string; default PropTypes.string)"""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'webviz_subsurface_components'
    _type = 'WebVizContinuousLegend'
    @_explicitize_args
    def __init__(self, min=Component.UNDEFINED, max=Component.UNDEFINED, title=Component.UNDEFINED, cssLegendStyles=Component.UNDEFINED, colorName=Component.UNDEFINED, horizontal=Component.UNDEFINED, colorTables=Component.UNDEFINED, id=Component.UNDEFINED, isRangeShown=Component.UNDEFINED, legendFontSize=Component.UNDEFINED, tickFontSize=Component.UNDEFINED, numberOfTicks=Component.UNDEFINED, legendScaleSize=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'colorName', 'colorTables', 'cssLegendStyles', 'horizontal', 'isRangeShown', 'legendFontSize', 'legendScaleSize', 'max', 'min', 'numberOfTicks', 'tickFontSize', 'title']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'colorName', 'colorTables', 'cssLegendStyles', 'horizontal', 'isRangeShown', 'legendFontSize', 'legendScaleSize', 'max', 'min', 'numberOfTicks', 'tickFontSize', 'title']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(WebVizContinuousLegend, self).__init__(**args)
