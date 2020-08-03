/**
 * A listener for listening on changes in width and height on a target element.
 * @param {HTMLElement} targetEl
 * @param {Function} callback
 * @param {Number} time
 */
export const onSizeChange = (targetEl, callback, time = 2000) => {
    let timeOutIndex = null;

    let prevWidth = targetEl.clientWidth;
    let prevHeight = targetEl.clientHeight;

    const hasChange = () => {
        if (
            prevWidth !== targetEl.clientWidth ||
            prevHeight !== targetEl.clientHeight
        ) {
            callback && callback(targetEl.clientWidth, targetEl.clientHeight);
        }

        prevWidth = targetEl.clientWidth;
        prevHeight = targetEl.clientHeight;

        timeOutIndex = setTimeout(hasChange, time);
    };

    timeOutIndex = setTimeout(hasChange, time);

    return () => {
        clearTimeout(timeOutIndex);
    };
};
