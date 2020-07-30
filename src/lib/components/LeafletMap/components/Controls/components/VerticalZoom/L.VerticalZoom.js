import L from "leaflet";

L.VerticalZoom = L.Control.extend({
    initialize: function(position) {
        this.setPosition(position);
    },

    onAdd: function(map) {
        const panelDiv = (this.panelDiv = L.DomUtil.create(
            "div",
            "leaflet-custom-control"
        ));

        panelDiv.addEventListener("mouseover", () => map.dragging.disable());
        panelDiv.addEventListener("mouseout", () => map.dragging.enable());

        panelDiv.style.height = "200px";
        panelDiv.style.paddingBottom = "10px";
        panelDiv.style.paddingTop = "10px";

        return panelDiv;
    },
});

L.verticalZoom = position => {
    return new L.VerticalZoom(position);
};
