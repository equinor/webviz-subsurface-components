/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (C) 2020 - Equinor ASA. */

/**
 * Utility class for handling transform attribute in an svg element
 */
export default class SVGTransform {
    constructor(transform) {
        this.TRANSFORM_REGEX = /(\w+)\(([^,)]+),?([^)]+)?\)/gi;
        this.transform = this.parseTransform(transform);
    }

    /**
     * Parse the transform attribute into a convenient object for manipulation.
     *
     * e.g. "translate(10,50)" => { translate: ['10', '50'] }
     *
     * @param { string } transformString
     */
    parseTransform(transformString) {
        const transformObj = {};
        if (!transformString) {
            return transformObj;
        }

        const transformations = transformString.match(this.TRANSFORM_REGEX);

        transformations.forEach((transform) => {
            const methodAndValues = transform.match(/[\w.-]+/g);
            const method = methodAndValues.shift();

            transformObj[method] = methodAndValues;
        });

        return transformObj;
    }

    addTransform(type, params) {
        this.transform[type] = params.map((item) => `${item}`);
    }

    /**
     * Outputs the convenience transforms object back into string (which is put inside the SVG transform attribute)
     */
    toString() {
        const transforms = Object.entries(this.transform);

        const transformString = transforms.reduce(
            (accumulator, currentValue) => {
                const values = currentValue[1].join(",");

                return `${accumulator} ${currentValue[0]}(${values})`;
            },
            ""
        );

        return transformString;
    }
}

export const range = (num) => [...Array(num)].map((_, i) => i);
