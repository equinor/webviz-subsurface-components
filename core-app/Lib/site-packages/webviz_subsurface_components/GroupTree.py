# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class GroupTree(Component):
    """A GroupTree component.


Keyword arguments:

- id (string; required):
    The ID of this component, used to identify dash components in
    callbacks. The ID needs to be unique across all of the components
    in an app.

- data (list; optional):
    Array of JSON objects describing group tree data.

- edge_metadata_list (optional):
    Arrays of metadata. Used in drop down selectors and tree
    visualization.

- node_metadata_list (optional)"""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'webviz_subsurface_components'
    _type = 'GroupTree'
    @_explicitize_args
    def __init__(self, id=Component.REQUIRED, data=Component.UNDEFINED, edge_metadata_list=Component.UNDEFINED, node_metadata_list=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'data', 'edge_metadata_list', 'node_metadata_list']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'data', 'edge_metadata_list', 'node_metadata_list']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        for k in ['id']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')

        super(GroupTree, self).__init__(**args)
