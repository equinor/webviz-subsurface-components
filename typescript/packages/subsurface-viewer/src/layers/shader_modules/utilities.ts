const fs = `vec4 encodeVertexIndexToRGB (int vertexIndex) {

    float r = 0.0;
    float g = 0.0;
    float b = 0.0;
 
    if (vertexIndex >= (256 * 256) - 1) {
       r = floor(float(vertexIndex) / (256.0 * 256.0));
       vertexIndex -= int(r * (256.0 * 256.0));
    }
 
    if (vertexIndex >= 256 - 1) {
       g = floor(float(vertexIndex) / 256.0);
       vertexIndex -= int(g * 256.0);
    }
 
    b = float(vertexIndex);
 
    return vec4(r / 255.0, g / 255.0, b / 255.0, 1.0);   
 }
 `;

export const utilities = {
    name: "utilities",
    fs,
};
