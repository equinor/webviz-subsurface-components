/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

import EventBus from "./eventbus";

/**
 * Base class representing a part of the visualisation.
 *
 * All configuration that is the same for the components throughout the
 * visualisation should be put here.  Also, serves as a "proxy" object for the
 * event bus system for attaching events handlers to a component and firing off
 * events.
 */
export default class Component {
    constructor() {
        this.eventBus = new EventBus();
    }

    /**
     * See {@link EventBus#on}
     */
    on(eventName, handler) {
        this.eventBus.on(eventName, handler);
    }

    /**
     * See {@link EventBus#emit}
     */
    emit(eventName, data) {
        this.eventBus.emit(eventName, data);
    }

    /**
     * See {@link EventBus#off}
     */
    off(eventName, handler) {
        this.eventBus.off(eventName, handler);
    }
}
