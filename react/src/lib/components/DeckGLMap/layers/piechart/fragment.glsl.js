export default `\
#version 300 es
#define SHADER_NAME graph-layer-fragment-shader

precision highp float;

flat in int pie_index_;

out vec4 fragColor;

in vec4 vColor;

void main(void) {

  //Picking pass.
  if (picking_uActive) {
     // Express triangle index in 255 system.
     float r = 0.0;
     float g = 0.0;
     float b = 0.0;
 
     int idx = pie_index_;
 
     if (idx >= (256 * 256) - 1) {
        r = floor(float(idx) / (256.0 * 256.0));
        idx -= int(r * (256.0 * 256.0));
     }
 
     if (idx >= 256 - 1) {
        g = floor(float(idx) / 256.0);
        idx -= int(g * 256.0);
     }
 
     b = float(idx);
 
     fragColor = vec4(r / 255.0, g / 255.0, b / 255.0,  1.0);
     return;
  }

  fragColor = vColor;
}
`;
