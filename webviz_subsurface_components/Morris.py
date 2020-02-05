# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class Morris(Component):
    """A Morris component.


Keyword arguments:
- id (string; required)
- parameter (string; optional)
- output (list of dicts; optional)
- parameters (list of dicts; optional)
- height (number; default 800)"""
    @_explicitize_args
    def __init__(self, id=Component.REQUIRED, parameter=Component.UNDEFINED, output=Component.UNDEFINED, parameters=Component.UNDEFINED, height=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'parameter', 'output', 'parameters', 'height']
        self._type = 'Morris'
        self._namespace = 'webviz_subsurface_components'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'parameter', 'output', 'parameters', 'height']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in ['id']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(Morris, self).__init__(**args)
