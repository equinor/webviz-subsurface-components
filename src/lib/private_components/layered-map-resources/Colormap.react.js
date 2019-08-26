import L from 'leaflet'
import React, {Component} from 'react'
import { withLeaflet, MapControl } from 'react-leaflet'
import PropTypes from 'prop-types'


class Colormap extends MapControl {

  createLeafletElement(props) {
    const MapInfo = L.Control.extend({
      onAdd: map => {
        this.panelDiv = L.DomUtil.create('div', 'info');
        this.panelDiv.innerHTML = `Some colormap`
        return this.panelDiv;
      }
    });
    return new MapInfo({ position: props.position });
  }

  componentDidMount() {
    const { map } = this.props.leaflet;
    this.leafletElement.addTo(map);
  }
}

export default withLeaflet(Colormap);
