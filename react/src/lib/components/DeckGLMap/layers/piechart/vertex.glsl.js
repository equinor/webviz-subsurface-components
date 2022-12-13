export default `\
#version 300 es
#define SHADER_NAME graph-layer-axis-vertex-shader

precision highp float;

in vec3 positions;
in vec3 colors;
in float do_scale;
in float mx;
in float my;
in int pie_index;

flat out int pie_index_;

uniform float scale;

out vec4 vColor;

void main(void) {

   vec3 v = positions;

   if (do_scale == 1.0) {
      // Triangle vertex' are (mx,my) and two more. The
      // latter two will be scaled so that the triangle (or the pie piece its part of) will
      // have constant size depending on zoom.
      float x = scale * (positions.x - mx);
      float y = scale * (positions.y - my);

      v = vec3(x + mx, y + my, 0.0);
   }

   vec3 position_commonspace = project_position(v);

   vColor = vec4(colors.rgb, 1.0);

   pie_index_ = pie_index;

   gl_Position = project_common_position_to_clipspace(vec4(position_commonspace, 0.0));
}
`;
