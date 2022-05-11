const fragmentShader = `#version 300 es
#define SHADER_NAME graph-layer-fragment-shader

precision highp float;

in vec3 vColor;
in vec3 position_commonspace;
in vec3 cameraPosition;
flat in int cell_index_fs;

out vec4 fragColor;

void main(void) {
  
  if (picking_uActive) {
    // Express cell index in 255 system.
    float r = 0.0;
    float g = 0.0;
    float b = 0.0;

    int cell_index = cell_index_fs;

    if (cell_index >= (256 * 256) - 1) {
       r = floor(float(cell_index) / (256.0 * 256.0));
       cell_index -= int(r * (256.0 * 256.0));
    }

    if (cell_index >= 256 - 1) {
       g = floor(float(cell_index) / 256.0);
       cell_index -= int(g * 256.0);
    }

    b = float(cell_index);

    fragColor = vec4(r / 255.0, g / 255.0, b / 255.0,  1.0);
    return;
  }

  // KEEP. Disable lighting for now. Better with uniform color pver a cell.
  // vec3 normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));

  // // Use normal lighting.
  // vec3 lightColor = lighting_getLightColor(vColor.rgb, cameraPosition, position_commonspace.xyz, normal);
  // fragColor = vec4(lightColor, 1.0);

  fragColor = vec4(vColor, 1.0);
}
`;

export default fragmentShader;
