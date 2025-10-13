# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class ReadoutComponent(Component):
    """A ReadoutComponent component.


Keyword arguments:

- pickingInfoPerView (dict; required)

    `pickingInfoPerView` is a dict with keys:


- viewId (string; required)"""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'webviz_subsurface_components'
    _type = 'ReadoutComponent'
    @_explicitize_args
    def __init__(self, viewId=Component.REQUIRED, pickingInfoPerView=Component.REQUIRED, **kwargs):
        self._prop_names = ['pickingInfoPerView', 'viewId']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['pickingInfoPerView', 'viewId']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        for k in ['pickingInfoPerView', 'viewId']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')

        super(ReadoutComponent, self).__init__(**args)
