import L from 'leaflet';

L.SwitchControl = L.Control.extend({

    initialize: function(position) {
        this.setPosition(position);
    },

    onAdd: function(map) {
        this.panelDiv = L.DomUtil.create(
            "div",
            "leaflet-custom-control"
        );

        this.panelDiv.addEventListener("mouseover", () => {
            map.dragging.disable();
            map.doubleClickZoom.disable();
            // map._handlers.forEach(function(handler){handler.disable();});
        });
        this.panelDiv.addEventListener("mouseout", () => {
            map.dragging.enable();
            map.doubleClickZoom.enable();
           // map._handlers.forEach(function(handler){handler.enable();});
        });

        return this.panelDiv;
    },
});

L.switchControl = function(position) {
    return new L.SwitchControl(position);
}