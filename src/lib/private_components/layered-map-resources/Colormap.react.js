import L from 'leaflet'
import React, {Component} from 'react'
import { withLeaflet, MapControl } from 'react-leaflet'
import PropTypes from 'prop-types'

class Colormap extends MapControl {

  createColorBar(node) {
    const img_div = document.createElement('div')
    const left_label_div = document.createElement('div')
    const right_label_div = document.createElement('div')

    node.classList.add('leaflet-colorbar')
    img_div.classList.add('leaflet-colorbar-image')
    right_label_div.classList.add('leaflet-colorbar-right-label')

    left_label_div.textContent = `${this.props.minvalue} ${this.props.unit}`
    right_label_div.textContent = `${this.props.maxvalue} ${this.props.unit}`

    node.appendChild(img_div)
    node.appendChild(left_label_div)
    node.appendChild(right_label_div)

    const img = new Image()
    img.src = this.props.colormap
    img.style.width = '100%'
    img.style.height = '10px'
    img_div.appendChild(img)

  }

  createLeafletElement(props) {
    const MapInfo = L.Control.extend({
      onAdd: map => {
        this.panelDiv = L.DomUtil.create('div', 'leaflet-custom-control')
        this.createColorBar(this.panelDiv)
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
