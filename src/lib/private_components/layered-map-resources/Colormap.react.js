import React, {Component} from 'react'
import L from 'leaflet'
import { withLeaflet, MapControl } from 'react-leaflet'


class Colormap extends MapControl {

  createLeafletElement(opts) {
    const MapInfo = L.Control.extend({
      onAdd: map => {
        this.panelDiv = L.DomUtil.create('div', 'info')
        this.panelDiv.innerHTML = `Some colormap`
        return this.panelDiv
      }
    });
    return new MapInfo({ position: 'bottomleft' })
  }

  componentDidMount() {
    this.leafletElement.addTo(this.props.leaflet.map)
  }

}

export default withLeaflet(Colormap)
