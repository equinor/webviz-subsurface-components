import React, { Component } from "react";
import PropTypes from "prop-types";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";


class MousePosition extends Component {

    componentDidMount() {
        this.addControl();
        this.createEvent();
    }

    componentDidUpdate() {


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
    
            updateHTML: function(x, y, z) {
              this._latlng.innerHTML = "x: " + x + "   y: " + y + " z: " + z;
            }
          });
          this.position = new Position();
          this.props.map.addControl(this.position);
    }

 

    createEvent() {
      this.el = L.DomUtil.get("leaflet-zoom-animated");
      // var test2 = document.getElementsByClassName("leaflet-canvas-layer leaflet-zoom-animated");
      
      this.props.map.addEventListener('click', (event) => {
  
        // console.log("ctx iamgeData: ", test)
        // console.log("test", test2)
     
        let x = Math.round(event.latlng.lng );
        let y = Math.round(event.latlng.lat );
        // let x = Math.round(event.containerPoint.x * 100000) / 100000; // e.clientx
        // let y = Math.round(event.containerPoint.y * 100000) / 100000; //e.clienty
        
        const z = (y * 1111 + x) / 4
        console.log("\nx: ", x , "\ny", y)

        this.position.updateHTML(x, y, z);
      });
    }

    setLatLng = (lat, lng, z)  => {
        this.position.updateHTML(lat,lng, z)
    }
    render() { 
        return (null);
    }
    
}


MousePosition.defaultProps = {
    position: "bottomleft"
};



MousePosition.propTypes = {
    map: PropTypes.object.isRequired,

    position: PropTypes.string,
};

export default MousePosition;
