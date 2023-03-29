/**
 * Base class representing a part of the visualisation.
 *
 * All configuration that is the same for the components throughout the
 * visualisation should be put here.  Also, serves as a "proxy" object for the
 * event bus system for attaching events handlers to a component and firing off
 * events.
 */
export default class Component {
    eventBus: EventBus;
    /**
     * See {@link EventBus#on}
     */
    on(eventName: any, handler: any): void;
    /**
     * See {@link EventBus#emit}
     */
    emit(eventName: any, data: any): void;
    /**
     * See {@link EventBus#off}
     */
    off(eventName: any, handler: any): void;
}
import EventBus from "./eventbus";
