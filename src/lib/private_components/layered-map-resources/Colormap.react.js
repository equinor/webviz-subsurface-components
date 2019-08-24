import L from 'leaflet'
import React, {Component} from 'react'
import { withLeaflet, MapControl } from 'react-leaflet'
import PropTypes from 'prop-types'


class Colormap extends MapControl {

  createLeafletElement(opts) {
    const MapInfo = L.Control.extend({
      onAdd: map => {
        this.panelDiv = L.DomUtil.create('div', 'info');
        this.panelDiv.innerHTML = `Some colormap`
        return this.panelDiv;
      }
    });
    return new MapInfo({ position: 'bottomleft' });
  }

  componentDidMount() {
    const { map } = this.props.leaflet;
    this.leafletElement.addTo(map);
  }
}

export default withLeaflet(Colormap);
