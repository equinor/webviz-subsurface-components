/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import L from "leaflet";

L.SwitchControl = L.Control.extend({
    initialize: function (position) {
        this.setPosition(position);
    },

    onAdd: function (map) {
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

L.switchControl = function (position) {
    return new L.SwitchControl(position);
};
