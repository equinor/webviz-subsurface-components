const vsShader = `\
#version 300 es
#define SHADER_NAME vertex-shader

precision highp float;

// Primitive attributes
in vec3 positions;
in float properties;
//in vec3 normals;
in vec3 colors;

in int vertex_indexs;
flat out int vertex_indexs_;


// Outputs to fragment shader
out vec2 vTexCoord;
out vec3 cameraPosition;
// out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec4 vColor;
out vec3 worldPos;
out float property;


void main(void) {
   cameraPosition = project_uCameraPosition;

   worldPos = positions;

   vertex_indexs_ = vertex_indexs;

   vColor = vec4(colors.rgb, 1.0);

   property = properties;

   position_commonspace = vec4(project_position(positions), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);
}
`;

export default vsShader;
