const fs = `//

bool isNanValue(float value) {
   // isnan() does not work in some systems, , neither does (value == value)
   return (value < 0.0 || value > 0.0 || value == 0.0) ? false : true;
}

const int MAX_INDEX = 256 * 256 * 256 - 1; // 16777215

// Encodes an index [0..16777215] to RGB color.
// Note: 256 * 256 * 256 - 1 = 16777215
// Alpha value is overwritten by Deck.gl to encode the layer index
vec4 encodeIndexToRGB(int index) {
   index = clamp(index, 0, MAX_INDEX);

   vec4 encoded = vec4(index >> 16 & 0xff, index >> 8 & 0xff, index & 0xff, 255.0);
   return encoded / 255.0;   
}

// Encodes a normalized float [0..1] to RGB color.
// The value is clamped to [0, 1] before encoding.
// Due to OpenGL framebuffer precision, only 16777215 values are distinguished.
// Note: 256 * 256 * 256 - 1 = 16777215
// Alpha value is overwritten by Deck.gl to encode the layer index
vec4 encodeNormalizedValueToRGB(float value) {
   value = clamp(value, 0.0, 1.0);
   return encodeIndexToRGB(int(value * float(MAX_INDEX))); 
}

// Encodes a normalized float [0..1] to RGB color.
// NaN gets encoded to [1, 1, 1, 1].
// The value is clamped to [0, 1] before encoding.
// Due to OpenGL framebuffer precision, only 16777214 values are distinguished.
// Note: 256 * 256 * 256 - 2 = 16777214 (one is reserved for NaN)
// Alpha value is overwritten by Deck.gl to encode the layer index
vec4 encodeNormalizedValueWithNaNToRGB(float value) {
   if( isNanValue(value) ) {
      return vec4(1.0, 1.0, 1.0, 1.0);
   }
   value = clamp(value, 0.0, 1.0);
   return encodeIndexToRGB(int(value * float(MAX_INDEX - 1))); 
}
`;

export const utilities = {
    name: "utilities",
    fs,
};

type RGB = [number, number, number];

const constants = {
    MAX_INDEX: 256 * 256 * 256 - 1, // 16777215
    SHIFT_VECTOR: [16, 8, 0] as RGB,
    ENCODE_VECTOR: [16777215 / 65536, 16777215 / 256, 16777215] as RGB,
    v256: 256, // 256
    v256_2: 256 * 256, // 65536
    v256_3: 256 * 256 * 256, // 16777216
    MAX_NORMALIZED_FLOAT:
        255 / 256 +
        255 / 256 / 256 +
        255 / 256 / 256 / 256 +
        255 / 256 / 256 / 256 / 256,
    scaleForNaN: (256 * 256 * 256 - 1) / (256 * 256 * 256),
};

/**
 * Encodes a numeric index into an RGB array, where each element represents
 * a color channel (red, green, blue) in the range [0, 255].
 *
 * This function is the same than the shader function `encodeIndexToRGB`,
 * except that the shader function returns values in the range [0, 1] to satisfy
 * OpenGL's requirements for color values.
 *
 * The encoding uses bit-shifting to split the index into three 8-bit values,
 * allowing for unique representation of indices from 0 to 16,777,215.
 *
 * @param index - The numeric index to encode. Values outside the range [0, 16,777,215]
 *                are clamped to fit within the representable range.
 * @returns An array of three numbers representing the encoded RGB value.
 */
export function encodeIndexToRGB(index: number): RGB {
    // clamp to range that can be encoded
    index = Math.min(Math.max(index, 0), constants.MAX_INDEX);

    const encoded = constants.SHIFT_VECTOR.map(
        (v) => (index >> v) & 0xff
    ) as RGB;
    return encoded;
}

/**
 * Decodes a numeric index from an RGB-encoded array.
 * Used to decode indices encoded with the shader function `encodeIndexToRGB`.
 *
 * The function interprets the input array as a packed 24-bit integer,
 * where each element represents a color channel (red, green, blue).
 * The index is calculated as: (red * 65536) + (green * 256) + blue.
 *
 * @param encodedIndex - An array of three numbers representing the RGB channels.
 * @returns The decoded numeric index.
 */
export function decodeIndexFromRGB(encodedIndex: RGB): number {
    return 65536 * encodedIndex[0] + 256 * encodedIndex[1] + encodedIndex[2];
}

/**
 * Encodes a normalized value (in the range [0, 1]) into an RGB representation,
 * where each element represents a color channel (red, green, blue) in the range [0, 255].
 *
 * This function is the same than the shader function `encodeNormalizedValueToRGB`,
 * except that the shader function returns values in the range [0, 1] to satisfy
 * OpenGL's requirements for color values.
 *
 * The value is first clamped to the [0, 1] range, then scaled by `constants.MAX_INDEX`
 * and passed to `encodeIndexToRGB` for conversion.
 *
 * @param value - The normalized value to encode, expected to be between 0 and 1.
 * @returns An RGB object representing the encoded value.
 */
export function encodeNormalizedValueToRGB(value: number): RGB {
    // clamp to [0, 1]
    value = Math.min(Math.max(value, 0.0), 1.0);

    return encodeIndexToRGB(value * constants.MAX_INDEX);
}

/**
 * Decodes a normalized value from an RGB-encoded array.
 * Used to decode indices encoded with the shader function `encodeNormalizedValueToRGB`.
 *
 * The function interprets the input `encodedValue` as a 3-element array representing
 * the red, green, and blue channels. It reconstructs the original value by combining
 * the channels into a single integer and normalizing it by dividing by `constants.MAX_INDEX`.
 *
 * @param encodedValue - An array of three numbers representing the RGB channels.
 * @returns The decoded normalized value as a number in the range [0, 1].
 */
export function decodeNormalizedValueFromRGB(encodedValue: RGB): number {
    return (
        (65536 * encodedValue[0] + 256 * encodedValue[1] + encodedValue[2]) /
        constants.MAX_INDEX
    );
}

/**
 * Encodes a normalized value (in the range [0, 1]) into an RGB representation,
 * where each element represents a color channel (red, green, blue) in the range [0, 255].
 * The value can be NaN, which gets encoded to [255, 255, 255].
 *
 * This function is the same than the shader function `encodeNormalizedValueWithNaNToRGB`,
 * except that the shader function returns values in the range [0, 1] to satisfy
 * OpenGL's requirements for color values.
 *
 * The value is first clamped to the [0, 1] range, then scaled by `constants.MAX_INDEX`
 * and passed to `encodeIndexToRGB` for conversion.
 *
 * @param value - The normalized value to encode, expected to be between 0 and 1.
 * @returns An RGB object representing the encoded value.
 */
export function encodeNormalizedValueWithNaNToRGB(value: number): RGB {
    if (Number.isNaN(value)) {
        return [255, 255, 255];
    }

    // clamp to [0, 1]
    value = Math.min(Math.max(value, 0.0), 1.0);
    // MAX_INDEX is used for NaN, so we have one less value to use.
    return encodeIndexToRGB(value * (constants.MAX_INDEX - 1));
}

/**
 * Decodes a normalized value from an RGB-encoded array.
 * Used to decode indices encoded with the shader function `encodeNormalizedValueWithNaNToRGB`.
 *
 * The function interprets the input `encodedValue` as a 3-element array representing
 * the red, green, and blue channels. It reconstructs the original value by combining
 * the channels into a single integer and normalizing it by dividing by `constants.MAX_INDEX`.
 *
 * @param encodedValue - An array of three numbers representing the RGB channels.
 * @returns The decoded normalized value as a number in the range [0, 1].
 */
export function decodeNormalizedValueWithNaNFromRGB(encodedValue: RGB): number {
    if (
        encodedValue[0] === 255 &&
        encodedValue[1] === 255 &&
        encodedValue[2] === 255
    ) {
        return Number.NaN;
    }
    return (
        (65536 * encodedValue[0] + 256 * encodedValue[1] + encodedValue[2]) /
        (constants.MAX_INDEX - 1)
    );
}
