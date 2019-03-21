/**
 * Class representing the event pub/sub system in the application.
 *
 * Using .on, handlers are subscribed to an event. .emit fires off the event,
 * and all handlers are called.
 *
 * Used by {@link Component}.
 */
export default class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     *  Attach an event handler.
     *  Handler is added to the list of handlers for a specific event.
     *  @param { string } eventName - Event name
     *  @param { function(Object) } handler - Event handler
     */
    on(eventName, handler) {
        if (!eventName) {
            throw new Error('No event name provided');
        }
        if (!handler) {
            throw new Error('No handler provided');
        }

        const events = this.events[eventName];

        if (!events) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(handler);
    }

    /**
     * Emit an event.
     *
     * Calls handlers which belong to the array of handlers for the event with
     * the data as the parameter
     *
     * @param { string } eventName - Event name
     * @param { function(Object)} data - Object sent as a parameter to all the
     *     handlers
     */
    emit(eventName, data) {
        if (!eventName) {
            throw new Error('No event name provided');
        }

        const events = this.events[eventName];

        if (!events) {
            return;
        }

        events.forEach(e => e(data));
    }

    /**
     * Remove handler from the event handlers list.
     *
     * @param { string } eventName - Event name
     * @param { function(Object) } handler - Event handler
     */
    off(eventName, handler) {
        if (!eventName) {
            throw new Error('No event name provided');
        }

        if (!handler) {
            throw new Error('No handler provided');
        }

        const events = this.events[eventName];

        if (!events) {
            return;
        }

        this.events[eventName] = this.events[eventName].filter(
            eventHandler => eventHandler !== handler
        );
    }
}
