# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class ViewAnnotation(Component):
    """A ViewAnnotation component.


Keyword arguments:

- children (a list of or a singular dash component, string or number; optional)

- id (string; required)"""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'webviz_subsurface_components'
    _type = 'ViewAnnotation'
    @_explicitize_args
    def __init__(self, children=None, id=Component.REQUIRED, **kwargs):
        self._prop_names = ['children', 'id']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['children', 'id']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in ['id']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')

        super(ViewAnnotation, self).__init__(children=children, **args)
