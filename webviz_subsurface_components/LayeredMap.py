# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class LayeredMap(Component):
    """A LayeredMap component.


Keyword arguments:
- id (string; required): The ID of this component, used to identify dash components
in callbacks. The ID needs to be unique across all of the
components in an app.
- sync_ids (list; optional): IDs of other LayeredMap components which should be updated with same zoom/pan
as in this one when the user changes zoom/pan in this component instance.
For convenience, you can include the same ID as this instance (it will be ignored).
- scaleY (number; default 1): The initial scale of the y axis (relative to the x axis).
A value >1 increases the visual length of the y axis compared to the x axis.
Updating this property will override any interactively set y axis scale.
This property does not have any effect unless showScaleY is true.
- showScaleY (boolean; default False): If to show the vertical scale slider or not.
- height (string | number; default 800): Height of the component
- draw_toolbar_polyline (boolean; default False): Add button to draw a polyline
- draw_toolbar_polygon (boolean; default False): Add button to draw a polygon
- draw_toolbar_marker (boolean; default False): Add button to draw a marker
- polyline_points (list; optional): Dash provided prop that returns the coordinates of the edited or clicked polyline
- polygon_points (list; optional): Dash provided prop that returns the coordinates of the edited or clicked polygon
- marker_point (list; optional): Dash provided prop that returns the coordinates of the edited or clicked marker
- lightDirection (list; default [1, 1, 1]): Light direction.
- layers (list; optional): An array of different layers. Each layer is a dictionary with the following structure:
          {
           'name': 'Name of my layer',  // Name of the layer (appears in the map layer control)
           'base_layer': true,
           'checked': false, // If it should be checked initially (only one base layer can have this as True)
           'data': [ ... ] // A list of the different map components this layer consists of (see below for the allowed components)
          }

For overlay layers ('base_layer' == false), 'checked' can be tru for an arbitrary number of overlay layers.
For base layers maximum one layer should be checked.
- hillShading (boolean; default True)
- uirevision (string; default ""): A string to control if map bounds should be recalculated on prop change.
       Recalculation will occur if this string changes (or when the layers array property
       goes from zero to non-zero length)."""
    @_explicitize_args
    def __init__(self, id=Component.REQUIRED, sync_ids=Component.UNDEFINED, scaleY=Component.UNDEFINED, showScaleY=Component.UNDEFINED, height=Component.UNDEFINED, draw_toolbar_polyline=Component.UNDEFINED, draw_toolbar_polygon=Component.UNDEFINED, draw_toolbar_marker=Component.UNDEFINED, polyline_points=Component.UNDEFINED, polygon_points=Component.UNDEFINED, marker_point=Component.UNDEFINED, lightDirection=Component.UNDEFINED, layers=Component.UNDEFINED, hillShading=Component.UNDEFINED, uirevision=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'sync_ids', 'scaleY', 'showScaleY', 'height', 'draw_toolbar_polyline', 'draw_toolbar_polygon', 'draw_toolbar_marker', 'polyline_points', 'polygon_points', 'marker_point', 'lightDirection', 'layers', 'hillShading', 'uirevision']
        self._type = 'LayeredMap'
        self._namespace = 'webviz_subsurface_components'
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'sync_ids', 'scaleY', 'showScaleY', 'height', 'draw_toolbar_polyline', 'draw_toolbar_polygon', 'draw_toolbar_marker', 'polyline_points', 'polygon_points', 'marker_point', 'lightDirection', 'layers', 'hillShading', 'uirevision']
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
