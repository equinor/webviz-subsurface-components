import L from "leaflet";

L.SwitchControl = L.Control.extend({
    initialize: function(position) {
        this.setPosition(position);
    },

    onAdd: function(map) {
        this.panelDiv = L.DomUtil.create("div", "leaflet-custom-control");

        this.panelDiv.addEventListener("mouseover", () => {
            map.dragging.disable();
            map.doubleClickZoom.disable();
        });
        this.panelDiv.addEventListener("mouseout", () => {
            map.dragging.enable();
            map.doubleClickZoom.enable();
        });

        return this.panelDiv;
    },
});

L.switchControl = function(position) {
    return new L.SwitchControl(position);
};
