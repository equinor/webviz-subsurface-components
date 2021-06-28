/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

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
