# AUTO GENERATED FILE - DO NOT EDIT

from dash.development.base_component import Component, _explicitize_args


class Morris(Component):
    """A Morris component.


Keyword arguments:
- output (list; optional)
- parameter (string; optional)
- id (string; required)
- parameters (list; optional)
- height (number; optional)

Available events: """
    @_explicitize_args
    def __init__(self, output=Component.UNDEFINED, parameter=Component.UNDEFINED, id=Component.REQUIRED, parameters=Component.UNDEFINED, height=Component.UNDEFINED, **kwargs):
        self._prop_names = ['output', 'parameter', 'id', 'parameters', 'height']
        self._type = 'Morris'
        self._namespace = 'webviz_subsurface_components'
        self._valid_wildcard_attributes =            []
        self.available_events = []
        self.available_properties = ['output', 'parameter', 'id', 'parameters', 'height']
        self.available_wildcard_properties =            []

        _explicit_args = kwargs.pop('_explicit_args')
        _locals = locals()
        _locals.update(kwargs)  # For wildcard attrs
        args = {k: _locals[k] for k in _explicit_args if k != 'children'}

        for k in [u'id']:
            if k not in args:
                raise TypeError(
                    'Required argument `' + k + '` was not specified.')
        super(Morris, self).__init__(**args)

    def __repr__(self):
        if(any(getattr(self, c, None) is not None
               for c in self._prop_names
               if c is not self._prop_names[0])
           or any(getattr(self, c, None) is not None
                  for c in self.__dict__.keys()
                  if any(c.startswith(wc_attr)
                  for wc_attr in self._valid_wildcard_attributes))):
            props_string = ', '.join([c+'='+repr(getattr(self, c, None))
                                      for c in self._prop_names
                                      if getattr(self, c, None) is not None])
            wilds_string = ', '.join([c+'='+repr(getattr(self, c, None))
                                      for c in self.__dict__.keys()
                                      if any([c.startswith(wc_attr)
                                      for wc_attr in
                                      self._valid_wildcard_attributes])])
            return ('Morris(' + props_string +
                   (', ' + wilds_string if wilds_string != '' else '') + ')')
        else:
            return (
                'Morris(' +
                repr(getattr(self, self._prop_names[0], None)) + ')')
