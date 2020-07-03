import React, { Component } from "react";
import PropTypes from "prop-types";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";


class MousePosition extends Component {

    componentDidMount() {
        this.addControl();
        this.createEvent();
    }

    addControl = () => {
        let Position = L.Control.extend({ 
            options: {
              position: this.props.position
            },
    
            onAdd: function (map) {
              const latlng = L.DomUtil.create('div', 'mouseposition');
              this._latlng = latlng;
              return latlng;
            },
    
            updateHTML: function(lat, lng) {
              this._latlng.innerHTML = "Lat: " + lat + "   Lng: " + lng;
            }
          });
          this.position = new Position();
          this.props.map.addControl(this.position);
    }

    createEvent() {
        this.props.map.addEventListener('mousemove', (event) => {
            let lat = Math.round(event.latlng.lat * 100000) / 100000;
            let lng = Math.round(event.latlng.lng * 100000) / 100000;
            this.position.updateHTML(lat, lng);
          });
    }

    setLatLng = (lat, lng)  => {
        this.position.updateHTML(lat,lng)
    }
    render() { 
        return (null);
    }
    
}


MousePosition.defaultProps = {
    position: "bottomleft",
};



MousePosition.propTypes = {
    map: PropTypes.object.isRequired,

    position: PropTypes.string,
};

export default MousePosition;
