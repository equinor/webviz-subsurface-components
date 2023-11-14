const vsShader = `\
#version 300 es
#define SHADER_NAME well-markers-vertex-shader
precision highp float;

attribute vec3 positions;
attribute vec3 instancePositions;

out vec4 position_commonspace;

void main(void) { 
   

   float edgePadding = 10.0;

   position_commonspace = vec4(project_position(positions + instancePositions), 0.0);

   gl_Position = project_common_position_to_clipspace(position_commonspace);
   
   // vec3 offset = edgePadding * positions;   
   // gl_Position.xy += project_pixel_size_to_clipspace(offset.xy); 
}
`;

export default vsShader;
