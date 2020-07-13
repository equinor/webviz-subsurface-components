import React, { Component } from "react";
import PropTypes from "prop-types";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";


class MousePosition extends Component {
  
    componentDidMount() {
        this.addControl();
        this.createEvent();
    }

    componentDidUpdate(prevProps) {
      if (this.props != prevProps) {
          this.createEvent();
      }
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


    //Get original imagedata
    createEvent() {

        document.addEventListener('imageOverlayURL', async (event) => {
            console.log("ImageOverlayURL:", event, event.url);

            const url = event.url;

            /**
             * @type {Image}
             */
            const image = await new Promise((res, rej) => {
                const image = new Image();
                image.onload = () => {
                    image.src = url;
                    res(image);
                }
            });
            

            const canvas = this.canvas = this.canvas || document.createElement('canvas');
            this.ctx = this.canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            this.ctx.drawImage(image, 0, 0);

            this.imageData = this.ctx.getImageData(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );

            console.log("width", this.canvas.width, " heuight ", this.canvas.height)
            
        });

        //TODO add indicator for cursor
        const NUMBER_COLOR_CHANNELS = 4;
        const NUMBER_DISCRETIZATION_LEVELS = 255;

        this.props.map.addEventListener('click', (event) => {
            console.log("clicked")
            if(!this.canvas) {
                return;
            }

            // // this.ctx = this.canvas.getContext("2d");
            this.imageData = this.ctx.getImageData(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
            console.log("image data, mouse pos: ", this.imageData.data)
            this.client_rect = this.canvas.getBoundingClientRect();
            console.log("Rect: ", this.client_rect);
        
            const screenX = ((event.originalEvent.clientX - this.client_rect.left) / this.client_rect.width) * this.canvas.width
            const screenY = ((event.originalEvent.clientY - this.client_rect.top) / this.client_rect.height) * this.canvas.height

            
            const x = Math.round(event.latlng.lng );
            const y = Math.round(event.latlng.lat );
            

            //method used in the original implementation, https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
            const redIndex = Math.floor((screenY * this.imageData.width + screenX) * NUMBER_COLOR_CHANNELS);
            const z = this.imageData.data[redIndex]
            console.log("red value from array: ", z)

            

            const red = this.ctx.getImageData(screenX, screenY, 1, 1).data[0];
            console.log("red value from click", red)


            const z_string = this.getZValue(red);

            this.setLatLng(x, y, z_string);


        })
    }

    getZValue = (r) => {

      return Math.floor(
        ((this.props.maxvalue - this.props.minvalue) *
            (r - 1)) /
            255 +
            this.props.minvalue
    );

    }

    setLatLng = (lat, lng, z)  => {
        this.position.updateHTML(lat,lng, z)
    }

    render() {
        return (null)      
    }
}

MousePosition.defaultProps = {
    position: "bottomleft"
};



MousePosition.propTypes = {
    map: PropTypes.object.isRequired,
    minvalue : PropTypes.number,
    maxvalue : PropTypes.number,
    position: PropTypes.string,
};

export default MousePosition;
