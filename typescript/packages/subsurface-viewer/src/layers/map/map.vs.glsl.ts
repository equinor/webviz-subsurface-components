export default `\
#version 300 es
#define SHADER_NAME map-vertex-shader

precision highp float;

// Primitive attributes
in vec3 positions;
in float properties;
in vec3 normals;
in vec3 colors;

// Outputs to fragment shader
out vec2 vTexCoord;
out vec3 cameraPosition;
out vec3 normals_commonspace;
out vec4 position_commonspace;
out vec4 vColor;
out vec3 worldPos;
out float propertyValue;
flat out int vertexIndex;

void main(void) {
   geometry.pickingColor = vec3(1.0, 1.0, 0.0);
   vertexIndex = gl_VertexID;

   vec3 position = positions;
   position[2] *= map.ZIncreasingDownwards ? -1.0 : 1.0;

   cameraPosition = project.cameraPosition;

   worldPos = position;
   geometry.worldPosition = position;

   normals_commonspace = normals;

   vColor = vec4(colors.rgb, 1.0);

   position_commonspace = vec4(project_position(position), 0.0);
   gl_Position = project_common_position_to_clipspace(position_commonspace);

   DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

   vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
   float propertyValue = properties;

   // This may happen due to GPU interpolation precision causing color artifacts.
   propertyValue = clamp(propertyValue, map.valueRangeMin, map.valueRangeMax);

   vColor = vec4(color.rgb, color.a * layer.opacity);
   DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
