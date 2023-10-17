const vsShader = `\
#version 300 es
#define SHADER_NAME vertex-shader

precision highp float;

// Primitive attributes
in vec3 positions;
in float properties;
in vec3 colors;

attribute vec3 positions64Low;

in int vertex_indexs;

// Outputs to fragment shader
out vec3 cameraPosition;
out vec4 position_commonspace;
out vec4 vColor;
out float property;

flat out int vertexId;

const vec3 pickingColor = vec3(1.0, 0.0, 0.0);

void main(void) {
   cameraPosition = project_uCameraPosition;

   
   geometry.worldPosition = positions;
   geometry.pickingColor = pickingColor;
   vertexId = gl_VertexID;

   vColor = vec4(colors.rgb, 1.0);

   property = properties;
   vec4 color = vec4(1.0);

   gl_Position = project_position_to_clipspace(positions, positions64Low, vec3(0.0), geometry.position);
   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   DECKGL_FILTER_COLOR(color, geometry);
}
`;

export default vsShader;
