const vsShader = `\
#version 300 es
#define SHADER_NAME grid3d-vertex-shader
precision highp float;


attribute vec3 positions;
attribute float properties;

// Outputs to fragment shader
out vec3 cameraPosition;
out vec4 position_commonspace;
out float property;

flat out int vertexIndex;

const vec3 pickingColor = vec3(1.0, 1.0, 0.0);

void main(void) { 
   
   vertexIndex = gl_VertexID;
   cameraPosition = project_uCameraPosition;
   property = properties;
   geometry.pickingColor = pickingColor;   
 
   position_commonspace = vec4(project_position(positions), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);
   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vec4 color = vec4(0.0);
   DECKGL_FILTER_COLOR(color, geometry);
}
`;

export default vsShader;
