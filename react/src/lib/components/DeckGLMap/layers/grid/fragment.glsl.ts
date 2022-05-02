const fragmentShader = `#version 300 es
#define SHADER_NAME graph-layer-fragment-shader

precision highp float;

in vec3 vColor;  // XXX in her i stedet?

out vec4 fragColor;

flat in int cell_index2;

in  vec3 position_commonspace;
in vec3 cameraPosition;

void main(void) {
  
  if (picking_uActive) {
    fragColor = vec4(float(cell_index2) / 255.0, 0.0, 0.0,   1.0); // XXX ser ikke ut som om cell_index2 kommer frem..
    return;
  }



  //fragColor = vec4(vColor, 1.0);    // vec4(0.0, 1.0, 0.0, 1.0);


  vec3 normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
  //vec3 normal = vec3(0.0, 0.0, 1.0);

// #ifdef DERIVATIVES_AVAILABLE
//      normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
// #else
//      vec3(0.0, 0.0, 1.0);


  //vec3 color = vColor;
  //fragColor = vec4(color, 1.0);    // vec4(0.0, 1.0, 0.0, 1.0);


  // Use normal lighting.
  vec3 lightColor = lighting_getLightColor(vColor.rgb, cameraPosition, position_commonspace.xyz, normal);
  fragColor = vec4(lightColor, 1.0);

//   DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

export default fragmentShader;
