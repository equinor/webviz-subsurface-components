import EventBus from './eventbus';

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
