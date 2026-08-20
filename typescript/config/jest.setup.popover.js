/**
 * Minimal polyfill for the HTML Popover API.
 *
 * jsdom does not implement `showPopover`/`hidePopover`/`togglePopover`, which
 * `@equinor/eds-core-react` v2 relies on for its menu and tooltip components.
 * Without this, any test rendering those components throws
 * "refs.floating.current?.hidePopover is not a function".
 */
if (typeof HTMLElement !== "undefined" && !HTMLElement.prototype.showPopover) {
    const openPopovers = new WeakSet();

    HTMLElement.prototype.showPopover = function showPopover() {
        openPopovers.add(this);
        this.style.display = "block";
    };

    HTMLElement.prototype.hidePopover = function hidePopover() {
        openPopovers.delete(this);
        this.style.display = "none";
    };

    HTMLElement.prototype.togglePopover = function togglePopover(force) {
        const shouldShow =
            typeof force === "boolean" ? force : !openPopovers.has(this);
        if (shouldShow) {
            this.showPopover();
        } else {
            this.hidePopover();
        }
        return shouldShow;
    };
}
