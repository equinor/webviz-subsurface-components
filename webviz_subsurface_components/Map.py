# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class Map(Component):
    """A Map component.


Keyword arguments:
- id (string; required): The ID of this component, used to identify dash components
in callbacks. The ID needs to be unique across all of the
components in an app.
- data (dict; required): The data the Map component should render (JSON format).
- height (number; default 800): The height of the Map component
- layerNames (list of strings; optional): The name of individual layers"""
    @_explicitize_args
    def __init__(self, id=Component.REQUIRED, data=Component.REQUIRED, height=Component.UNDEFINED, layerNames=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'data', 'height', 'layerNames']
        self._type = 'Map'
        self._namespace = 'webviz_subsurface_components'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'data', 'height', 'layerNames']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in ['id', 'data']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(Map, self).__init__(**args)
