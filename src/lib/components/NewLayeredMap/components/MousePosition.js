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
      this.el = L.DomUtil.create("canvas", "leaflet-canvas-layer leaflet-zoom-animated");      

      const canvases = document.getElementsByClassName('leaflet-canvas-layer leaflet-zoom-animated');


      
      const width = 0;
      const height = 0;
      const ctx = null;

      document.addEventListener('DOMContentLoaded', (event) => {
        const img    = canvases[1].toDataURL("image/png")
        console.log("img", img);
        width = canvases[1].width;
        height = canvases[1].width;
        ctx = canvases[1].getContext("webgl", {preserveDrawingBuffer: true});
      });


      this.props.map.addEventListener('click', (event) => {
        console.log(event.target)
        let x = Math.round(event.latlng.lng );
        let y = Math.round(event.latlng.lat );
        
        console.log("x: ", x, " y: ", y);
        console.log("width:", width, " height, ", height);
        console.log("ctx: ", ctx);

        const pixels = new Uint8Array(ctx.drawingBufferWidth * ctx.drawingBufferHeight * 4);
        ctx.readPixels(
          0, 
          0, 
          ctx.drawingBufferWidth, 
          ctx.drawingBufferHeight, 
          ctx.RGBA, 
          ctx.UNSIGNED_BYTE, 
          pixels);

          console.log(pixels)

          var pixelR = pixels[4 * (y * ctx.drawingBufferWidth + x)];
          var pixelG = pixels[4 * (y * ctx.drawingBufferWidth + x) + 1];
          var pixelB = pixels[4 * (y * ctx.drawingBufferWidth + x) + 2];
          var pixelA = pixels[4 * (y * ctx.drawingBufferWidth + x) + 3];
          console.log(pixelR, pixelG, pixelB, pixelA )
                
        this.position.updateHTML(x, y, x);
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
