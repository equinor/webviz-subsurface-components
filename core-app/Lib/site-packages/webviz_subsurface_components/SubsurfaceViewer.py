# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class SubsurfaceViewer(Component):
    """A SubsurfaceViewer component.


Keyword arguments:

- children (a list of or a singular dash component, string or number; optional)

- id (string; required):
    The ID of this component, used to identify dash components in
    callbacks. The ID needs to be unique across all of the components
    in an app.

- bounds (boolean | number | string | dict | list; optional):
    Coordinate boundary for the view defined as [left, bottom, right,
    top]. Should be used for 2D view only.

- cameraPosition (dict; optional):
    Camera state for the view defined as a ViewStateType. Should be
    used for 3D view only. If the zoom is given as a 3D bounding box,
    the camera state is computed to display the full box.

    `cameraPosition` is a dict with keys:

    - target (boolean | number | string | dict | list; required)

    - zoom (number; required)

    - rotationX (number; required)

    - rotationOrbit (number; required)

    - minZoom (number; optional)

    - maxZoom (number; optional)

    - transitionDuration (number; optional)

- checkDatafileSchema (boolean; optional):
    Validate JSON datafile against schema.

- colorTables (list of dicts; optional):
    Prop containing color table data.

    `colorTables` is a list of dicts with keys:

    - name (string; required)

    - discrete (boolean; required)

    - colors (list of list of 4 elements: [number, number, number, number]s; required)

    - description (string; optional)

    - colorNaN (list of 3 elements: [number, number, number]; optional)

    - colorBelow (list of 3 elements: [number, number, number]; optional)

    - colorAbove (list of 3 elements: [number, number, number]; optional)

- coordinateUnit (a value equal to: 'mm', 'cm', 'm', 'km', 'in', 'ft-us', 'ft', 'yd', 'mi', 'mm2', 'cm2', 'm2', 'ha', 'km2', 'in2', 'ft2', 'ac', 'mi2', 'mcg', 'mg', 'g', 'kg', 'oz', 'lb', 'mt', 't', 'mm3', 'cm3', 'ml', 'l', 'kl', 'm3', 'km3', 'tsp', 'Tbs', 'in3', 'fl-oz', 'cup', 'pnt', 'qt', 'gal', 'ft3', 'yd3', 'mm3/s', 'cm3/s', 'ml/s', 'cl/s', 'dl/s', 'l/s', 'l/min', 'l/h', 'kl/s', 'kl/min', 'kl/h', 'm3/s', 'm3/min', 'm3/h', 'km3/s', 'tsp/s', 'Tbs/s', 'in3/s', 'in3/min', 'in3/h', 'fl-oz/s', 'fl-oz/min', 'fl-oz/h', 'cup/s', 'pnt/s', 'pnt/min', 'pnt/h', 'qt/s', 'gal/s', 'gal/min', 'gal/h', 'ft3/s', 'ft3/min', 'ft3/h', 'yd3/s', 'yd3/min', 'yd3/h', 'C', 'F', 'K', 'R', 'ns', 'mu', 'ms', 's', 'min', 'h', 'd', 'week', 'month', 'year', 'Hz', 'mHz', 'kHz', 'MHz', 'GHz', 'THz', 'rpm', 'deg/s', 'rad/s', 'm/s', 'km/h', 'm/h', 'knot', 'ft/s', 's/m', 'min/km', 's/ft', 'min/mi', 'Pa', 'hPa', 'kPa', 'MPa', 'bar', 'torr', 'psi', 'ksi', 'b', 'Kb', 'Mb', 'Gb', 'Tb', 'B', 'KB', 'MB', 'GB', 'TB', 'lx', 'ft-cd', 'ppm', 'ppb', 'ppt', 'ppq', 'V', 'mV', 'kV', 'A', 'mA', 'kA', 'W', 'mW', 'kW', 'MW', 'GW', 'VA', 'mVA', 'kVA', 'MVA', 'GVA', 'VAR', 'mVAR', 'kVAR', 'MVAR', 'GVAR', 'Wh', 'mWh', 'kWh', 'MWh', 'GWh', 'J', 'kJ', 'VARh', 'mVARh', 'kVARh', 'MVARh', 'GVARH', 'deg', 'rad', 'grad', 'arcmin', 'arcsec'; optional)

- coords (dict; optional):
    Parameters for the InfoCard component.

    `coords` is a dict with keys:

    - visible (boolean; optional)

    - multiPicking (boolean; optional)

    - pickDepth (number; optional)

- deckGlRef (boolean | number | string | dict | list; optional):
    The reference to the deck.gl instance.

- editedData (dict; optional)

    `editedData` is a dict with strings as keys and values of type
    dict with keys:


- getTooltip (dict; optional):
    Override default tooltip with a callback.

    `getTooltip` is a dict with keys:


- innerRef (boolean | number | string | dict | list; optional):
    A reference to a wrapped div element, which can be used to attach
    an event listener.

- layers (list of boolean | number | string | dict | lists; optional):
    Array of externally created layers or layer definition records or
    JSON strings. Add '@@typedArraySupport' : True in a layer
    definition in order to use typed arrays as inputs.

- lights (dict; optional)

    `lights` is a dict with keys:

    - headLight (dict; optional)

        `headLight` is a dict with keys:

        - intensity (number; required)

        - color (list of 3 elements: [number, number, number]; optional)

    - ambientLight (dict; optional)

        `ambientLight` is a dict with keys:

        - intensity (number; required)

        - color (list of 3 elements: [number, number, number]; optional)

    - pointLights (list of dicts; optional)

        `pointLights` is a list of 1 elements: [dict with keys:

        - intensity (number; required)

        - position (list of 3 elements: [number, number, number]; required)

        - color (list of 3 elements: [number, number, number]; optional)]

    - directionalLights (list of dicts; optional)

        `directionalLights` is a list of 1 elements: [dict with keys:

        - intensity (number; required)

        - direction (list of 3 elements: [number, number, number]; required)

        - color (list of 3 elements: [number, number, number]; optional)]

- onMouseEvent (dict; optional):
    For get mouse events.

    `onMouseEvent` is a dict with keys:


- pickingRadius (number; optional):
    Extra pixels around the pointer to include while picking.

- resources (dict; optional):
    Resource dictionary made available in the DeckGL specification as
    an enum. The values can be accessed like this:
    `\"@@#resources.resourceId\"`, where `resourceId` is the key in
    the `resources` dict. For more information, see the DeckGL
    documentation on enums in the json spec:
    https://deck.gl/docs/api-reference/json/conversion-reference#enumerations-and-using-the--prefix.

    `resources` is a dict with keys:


- scale (dict; optional):
    Parameters for the Distance Scale component.

    `scale` is a dict with keys:

    - visible (boolean; optional)

    - incrementValue (number; optional)

    - widthPerUnit (number; optional)

    - cssStyle (dict; optional)

        `cssStyle` is a dict with strings as keys and values of type
        dict with keys:


- selection (dict; optional):
    Range selection of the current well.

    `selection` is a dict with keys:

    - well (string; required)

    - selection (list of 2 elements: [number, number]; required)

- triggerHome (number; optional):
    If changed will reset view settings (bounds or camera) to default
    position.

- triggerResetMultipleWells (number; optional)

- verticalScale (number; optional):
    A vertical scale factor, used to scale items in the view
    vertically.

- views (dict; optional):
    Views configuration for map. If not specified, all the layers will
    be displayed in a single 2D viewport.

    `views` is a dict with keys:

    - layout (list of 2 elements: [number, number]; required):
        Layout for viewport in specified as [row, column].

    - marginPixels (number; optional):
        Number of pixels used for the margin in matrix mode. Defaults
        to 0.

    - showLabel (boolean; optional):
        Show views label.

    - viewports (list of dicts; required):
        Layers configuration for multiple viewports.

        `viewports` is a list of dicts with keys:

        - id (string; required):

            Viewport id.

        - name (string; optional):

            Viewport name.

        - show3D (boolean; optional):

            If True, displays map in 3D view, default is 2D view (False).

        - layerIds (list of strings; optional):

            Layers to be displayed on viewport.

        - target (list of 2 elements: [number, number]; optional)

        - zoom (number; optional)

        - rotationX (number; optional)

        - rotationOrbit (number; optional)

        - verticalScale (number; optional)

        - isSync (boolean; optional)"""
    _children_props = []
    _base_nodes = ['children']
    _namespace = 'webviz_subsurface_components'
    _type = 'SubsurfaceViewer'
    @_explicitize_args
    def __init__(self, children=None, layers=Component.UNDEFINED, id=Component.REQUIRED, resources=Component.UNDEFINED, bounds=Component.UNDEFINED, cameraPosition=Component.UNDEFINED, triggerHome=Component.UNDEFINED, views=Component.UNDEFINED, coords=Component.UNDEFINED, scale=Component.UNDEFINED, coordinateUnit=Component.UNDEFINED, colorTables=Component.UNDEFINED, editedData=Component.UNDEFINED, checkDatafileSchema=Component.UNDEFINED, onMouseEvent=Component.UNDEFINED, getCameraPosition=Component.UNDEFINED, onRenderingProgress=Component.UNDEFINED, onDragStart=Component.UNDEFINED, onDragEnd=Component.UNDEFINED, onDrag=Component.UNDEFINED, getCursor=Component.UNDEFINED, triggerResetMultipleWells=Component.UNDEFINED, selection=Component.UNDEFINED, lights=Component.UNDEFINED, getTooltip=Component.UNDEFINED, verticalScale=Component.UNDEFINED, innerRef=Component.UNDEFINED, pickingRadius=Component.UNDEFINED, deckGlRef=Component.UNDEFINED, **kwargs):
        self._prop_names = ['children', 'id', 'bounds', 'cameraPosition', 'checkDatafileSchema', 'colorTables', 'coordinateUnit', 'coords', 'deckGlRef', 'editedData', 'getTooltip', 'innerRef', 'layers', 'lights', 'onMouseEvent', 'pickingRadius', 'resources', 'scale', 'selection', 'triggerHome', 'triggerResetMultipleWells', 'verticalScale', 'views']
        self._valid_wildcard_attributes =            []
        self.available_properties = ['children', 'id', 'bounds', 'cameraPosition', 'checkDatafileSchema', 'colorTables', 'coordinateUnit', 'coords', 'deckGlRef', 'editedData', 'getTooltip', 'innerRef', 'layers', 'lights', 'onMouseEvent', 'pickingRadius', 'resources', 'scale', 'selection', 'triggerHome', 'triggerResetMultipleWells', 'verticalScale', 'views']
        self.available_wildcard_properties =            []
        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs and excess named props
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in ['id']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')

        super(SubsurfaceViewer, self).__init__(children=children, **args)
