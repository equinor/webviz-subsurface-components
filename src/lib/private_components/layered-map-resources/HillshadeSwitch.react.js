import L from 'leaflet'
import ReactDOM from 'react-dom';
import React, {Component} from 'react'
import { withLeaflet, MapControl } from 'react-leaflet'
import PropTypes from 'prop-types'
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';


class HillshadeSwitch extends MapControl {

    constructor(props){
        super(props)
        this.state = {checked: this.props.checked}
    }

    handleChange(){
        this.setState({checked: !this.state.checked})
        this.props.onChange()
    }

    createLeafletElement(props) {
        const MapInfo = L.Control.extend({
            onAdd: map => {
                this.panelDiv = L.DomUtil.create('div')
                return this.panelDiv
            }
        })
        return new MapInfo({ position: props.position })
    }

    componentWillMount() {
        const { map } = this.props.leaflet;
        this.leafletElement.addTo(map);
    }

    componentDidMount() {
        // Overriding default MapControl implementation. We need to do the
        // addTo(map) call in componentWillMount in order for the portal
        // DOM node to be available for the render function.
    }

    render() {
        return ReactDOM.createPortal(
            <FormControlLabel
                control={<Switch checked={this.state.checked} onChange={this.handleChange.bind(this)} />}
                label={this.props.label}
            />, 
            this.panelDiv
        )
    }
}

export default withLeaflet(HillshadeSwitch);
