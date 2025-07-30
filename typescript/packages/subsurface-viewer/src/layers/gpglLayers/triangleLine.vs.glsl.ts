export default `\
#version 300 es
#define SHADER_NAME texture-line-vertex-shader

// Primitive attributes
in vec3 positions;

// Outputs to fragment shader
out vec4 vPosition;
out vec4 vColor;

const vec3 pickingColor = vec3(1.0, 1.0, 0.0);

void main(void) {
   geometry.pickingColor = pickingColor;

   vec3 position = positions;
   position[2] *= triangleMesh.ZIncreasingDownwards ? -1.0 : 1.0;

   // convert from projection system to cartesian common space
   vPosition = vec4(project_position(position), 0.0);
   gl_Position = project_common_position_to_clipspace(vPosition);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vColor = vec4(0.0, 0.0, 0.0, layer.opacity);
   DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
