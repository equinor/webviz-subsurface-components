# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class LeafletMap(Component):
    """A LeafletMap component.


Keyword arguments:

- id (string; required):
    The ID of this component, used to identify dash components in
    callbacks. The ID needs to be unique across all of the components
    in an app.

- autoScaleMap (boolean; optional):
    autoScaleMap makes the map listen for changes in width and height
    and automatically recalculates the map dimensions when changes
    occur.

- center (list; optional)

- click_position (list; optional):
    Map coordinates of a mouse click.

- clicked_shape (dict; optional):
    Shape clicked on JSON format.

- colorBar (dict; optional):
    ColorBar is a box that displays the colorScale.

    `colorBar` is a dict with keys:

    - position (string; optional)

- crs (string; optional)

- defaultBounds (list; optional)

- drawTools (dict; optional):
    DrawTools is a configuration for enabling drawing of polylines and
    areas.

    `drawTools` is a dict with keys:

    - drawMarker (boolean; optional)

    - drawPolygon (boolean; optional)

    - drawPolyline (boolean; optional)

    - position (string; optional)

- layers (list; optional):
    The layers.

- marker_point (list; optional):
    Dash provided prop that returns the coordinates of the edited or
    clicked marker.

- maxZoom (number; optional)

- minZoom (number; optional)

- mouseCoords (dict; optional):
    Mouse properties configuration.

    `mouseCoords` is a dict with keys:

    - position (string; optional)

- polygon_points (list; optional):
    Dash provided prop that returns the coordinates of the edited or
    clicked polygon.

- polyline_points (list; optional):
    Dash provided prop that returns the coordinates of the edited or
    clicked polyline.

- scaleY (dict; optional):
    ScaleY is a configuration for creating a slider for scaling the
    Y-axis.

    `scaleY` is a dict with keys:

    - scaleY (number; optional)

    - maxScaleY (number; optional)

    - minScaleY (number; optional)

    - position (string; optional)

- switch (dict; optional):
    Switch is a configuration for creating a switch-toggle.

    `switch` is a dict with keys:

    - value (boolean; optional)

    - disabled (boolean; optional)

    - position (string; optional)

    - label (string; optional)

- syncDrawings (boolean; optional):
    Boolean deciding whether or not to sync drawings between maps.

- syncedMaps (list; optional):
    Ids of other LayeredMap instances that should be synced with this
    instance.

- unitScale (dict; optional):
    UnitScale is a box that displays the the current unit scale on the
    map.

    `unitScale` is a dict with keys:

    - position (string; optional)

- updateMode (string; optional):
    Allows to choose between replacing the layers or updating them.

- zoom (number; optional)"""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'webviz_subsurface_components'
    _type = 'LeafletMap'
    @_explicitize_args
    def __init__(self, id=Component.REQUIRED, layers=Component.UNDEFINED, mouseCoords=Component.UNDEFINED, scaleY=Component.UNDEFINED, switch=Component.UNDEFINED, drawTools=Component.UNDEFINED, colorBar=Component.UNDEFINED, unitScale=Component.UNDEFINED, center=Component.UNDEFINED, defaultBounds=Component.UNDEFINED, zoom=Component.UNDEFINED, minZoom=Component.UNDEFINED, maxZoom=Component.UNDEFINED, crs=Component.UNDEFINED, syncedMaps=Component.UNDEFINED, syncDrawings=Component.UNDEFINED, updateMode=Component.UNDEFINED, autoScaleMap=Component.UNDEFINED, polyline_points=Component.UNDEFINED, polygon_points=Component.UNDEFINED, marker_point=Component.UNDEFINED, click_position=Component.UNDEFINED, clicked_shape=Component.UNDEFINED, **kwargs):
        self._prop_names = ['id', 'autoScaleMap', 'center', 'click_position', 'clicked_shape', 'colorBar', 'crs', 'defaultBounds', 'drawTools', 'layers', 'marker_point', 'maxZoom', 'minZoom', 'mouseCoords', 'polygon_points', 'polyline_points', 'scaleY', 'switch', 'syncDrawings', 'syncedMaps', 'unitScale', 'updateMode', 'zoom']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['id', 'autoScaleMap', 'center', 'click_position', 'clicked_shape', 'colorBar', 'crs', 'defaultBounds', 'drawTools', 'layers', 'marker_point', 'maxZoom', 'minZoom', 'mouseCoords', 'polygon_points', 'polyline_points', 'scaleY', 'switch', 'syncDrawings', 'syncedMaps', 'unitScale', 'updateMode', 'zoom']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args}

        for k in ['id']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')

        super(LeafletMap, self).__init__(**args)
