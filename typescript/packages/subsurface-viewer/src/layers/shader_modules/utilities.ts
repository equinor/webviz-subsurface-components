const fs = `vec4 encodeVertexIndexToRGB (int vertexIndex) {

    float r = 0.0;
    float g = 0.0;
    float b = 0.0;
 
    int idx = vertexIndex;
 
    if (idx >= (256 * 256) - 1) {
       r = floor(float(idx) / (256.0 * 256.0));
       idx -= int(r * (256.0 * 256.0));
    }
 
    if (idx >= 256 - 1) {
       g = floor(float(idx) / 256.0);
       idx -= int(g * 256.0);
    }
 
    b = float(idx);
 
    return vec4(r / 255.0, g / 255.0, b / 255.0, 1.0);   
 }
 `;

export const utilities = {
    name: "utilities",
    fs,
};
