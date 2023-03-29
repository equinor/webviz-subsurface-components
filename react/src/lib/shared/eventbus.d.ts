/**
 * Class representing the event pub/sub system in the application.
 *
 * Using .on, handlers are subscribed to an event. .emit fires off the event,
 * and all handlers are called.
 *
 * Used by {@link Component}.
 */
export default class EventBus {
    events: {};
    /**
     *  Attach an event handler.
     *  Handler is added to the list of handlers for a specific event.
     *  @param { string } eventName - Event name
     *  @param { function(Object) } handler - Event handler
     */
    on(eventName: string, handler: (arg0: any) => any): void;
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
    emit(eventName: string, data: (arg0: any) => any): void;
    /**
     * Remove handler from the event handlers list.
     *
     * @param { string } eventName - Event name
     * @param { function(Object) } handler - Event handler
     */
    off(eventName: string, handler: (arg0: any) => any): void;
}
