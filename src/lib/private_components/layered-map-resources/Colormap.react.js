import L from 'leaflet'
import { withLeaflet, MapControl } from 'react-leaflet'
import PropTypes from 'prop-types'

class Colormap extends MapControl {

  createColorBar(node) {
    const img_div = document.createElement('div')
    this.left_label_div = document.createElement('div')
    this.right_label_div = document.createElement('div')

    node.classList.add('leaflet-colorbar')
    img_div.classList.add('leaflet-colorbar-image')
    this.left_label_div.classList.add('leaflet-colorbar-left-label')
    this.right_label_div.classList.add('leaflet-colorbar-right-label')

    this.left_label_div.textContent = `${this.props.minvalue} ${this.props.unit}`
    this.right_label_div.textContent = `${this.props.maxvalue} ${this.props.unit}`

    node.appendChild(img_div)
    node.appendChild(this.left_label_div)
    node.appendChild(this.right_label_div)

    this.img = new Image()
    this.img.src = this.props.colormap
    this.img.style.width = '100%'
    this.img.style.height = '10px'
    img_div.appendChild(this.img)

  }

  createLeafletElement(props) {
    const MapInfo = L.Control.extend({
      onAdd: () => {
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
  componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.left_label_div.textContent = `${this.props.minvalue} ${this.props.unit}`
            this.right_label_div.textContent = `${this.props.maxvalue} ${this.props.unit}`
            this.img.src = this.props.colormap
        }
  }
}

Colormap.propTypes = {
    /* Colormap, given as base64 picture data string */
    colormap: PropTypes.string,

    /* Minimum value of color map */
    minvalue: PropTypes.number,

    /* Maximum value of color map */
    maxvalue: PropTypes.number,

    /* Unit to show in color map */
    unit: PropTypes.string
};


export default withLeaflet(Colormap);
