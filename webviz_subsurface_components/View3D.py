# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class View3D(Component):
    """A View3D component.


Keyword arguments:
- id (string; required)
- center_x (number; required)
- center_y (number; required)
- surface (dict; optional)
- wells (dict; optional)"""
    @_explicitize_args
    def __init__(self, id=Component.REQUIRED, center_x=Component.REQUIRED, center_y=Component.REQUIRED, surface=Component.UNDEFINED, wells=Component.UNDEFINED, height=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'center_x', 'center_y', 'surface', 'wells']
        self._type = 'View3D'
        self._namespace = 'webviz_subsurface_components'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'center_x', 'center_y', 'surface', 'wells']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in ['id', 'center_x', 'center_y']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(View3D, self).__init__(**args)
