# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class Leaflet(Component):
    """A Leaflet component.


Keyword arguments:
- id (string; optional)
- options (dict; optional)
- baseLayer (dict; optional)
- width (string; default "100%")
- height (string; default "800px")
- simpleCRS (boolean; default False)"""
    @_explicitize_args
    def __init__(self, id=Component.UNDEFINED, options=Component.UNDEFINED, baseLayer=Component.UNDEFINED, width=Component.UNDEFINED, height=Component.UNDEFINED, simpleCRS=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'options', 'baseLayer', 'width', 'height', 'simpleCRS']
        self._type = 'Leaflet'
        self._namespace = 'webviz_subsurface_components'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'options', 'baseLayer', 'width', 'height', 'simpleCRS']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in []:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(Leaflet, self).__init__(**args)
