# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class WebVizColorLegend(Component):
    """A WebVizColorLegend component.


Keyword arguments:

- colorName (string; default PropTypes.string)

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

    `cssLegendStyles` is a dict with keys:


- discreteData (dict; default PropTypes.any)

    `discreteData` is a dict with keys:

    - objects (dict; required)

        `objects` is a dict with keys:


- horizontal (boolean; default PropTypes.bool)

- isModal (boolean; default PropTypes.bool)

- isRangeShown (boolean; default PropTypes.bool)

- legendFontSize (number; default PropTypes.number)

- legendScaleSize (number; default PropTypes.number)

- max (number; default PropTypes.number)

- min (number; default PropTypes.number)

- numberOfTicks (number; default PropTypes.number)

- openColorSelector (boolean; default PropTypes.bool)

- reverseRange (boolean; default PropTypes.bool)

- tickFontSize (number; default PropTypes.number)

- title (string; default PropTypes.string)"""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'webviz_subsurface_components'
    _type = 'WebVizColorLegend'
    @_explicitize_args
    def __init__(self, colorTables=Component.UNDEFINED, min=Component.UNDEFINED, max=Component.UNDEFINED, title=Component.UNDEFINED, colorName=Component.UNDEFINED, horizontal=Component.UNDEFINED, discreteData=Component.UNDEFINED, reverseRange=Component.UNDEFINED, isModal=Component.UNDEFINED, isRangeShown=Component.UNDEFINED, legendFontSize=Component.UNDEFINED, tickFontSize=Component.UNDEFINED, numberOfTicks=Component.UNDEFINED, legendScaleSize=Component.UNDEFINED, cssLegendStyles=Component.UNDEFINED, openColorSelector=Component.UNDEFINED, **kwargs):
        self._prop_names = ['colorName', 'colorTables', 'cssLegendStyles', 'discreteData', 'horizontal', 'isModal', 'isRangeShown', 'legendFontSize', 'legendScaleSize', 'max', 'min', 'numberOfTicks', 'openColorSelector', 'reverseRange', 'tickFontSize', 'title']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['colorName', 'colorTables', 'cssLegendStyles', 'discreteData', 'horizontal', 'isModal', 'isRangeShown', 'legendFontSize', 'legendScaleSize', 'max', 'min', 'numberOfTicks', 'openColorSelector', 'reverseRange', 'tickFontSize', 'title']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        super(WebVizColorLegend, self).__init__(**args)
