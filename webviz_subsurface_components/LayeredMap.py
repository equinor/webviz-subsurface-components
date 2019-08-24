# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class LayeredMap(Component):
    """A LayeredMap component.


Keyword arguments:
- id (string; required): The ID of this component, used to identify dash components
in callbacks. The ID needs to be unique across all of the
components in an app.
- center (list; optional): Center [x, y] of map when initially loaded (in physical coordinates).
- map_bounds (list; optional): The map bounds of the input data, given as [[xmin, ymin], [xmax, ymax]] (in physical coordinates).
- layers (list; optional): An array of different layers. Each layer is a dictionary with the following structure:
          {
           'name': 'Name of my layer',  // Name of the layer (appears in the map layer control)
           'base_layer': true,
           'checked': false, // If it should be checked initially (only one base layer can have this as True)
           'data': [ ... ] // A list of the different map components this layer consists of (see below for the allowed components)
          }

For overlay layers ('base_layer' == false), 'checked' can be tru for an arbitrary number of overlay layers.
For base layers maximum one layer should be checked."""
    @_explicitize_args
    def __init__(self, id=Component.REQUIRED, center=Component.UNDEFINED, map_bounds=Component.UNDEFINED, layers=Component.UNDEFINED, height=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'center', 'map_bounds', 'layers']
        self._type = 'LayeredMap'
        self._namespace = 'webviz_subsurface_components'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'center', 'map_bounds', 'layers']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in ['id']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(LayeredMap, self).__init__(**args)
