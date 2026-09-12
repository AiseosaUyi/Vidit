#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform float u_feather;
uniform vec2 u_center;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  vec4 a = texture(u_outgoing, v_texCoord);
  vec4 b = texture(u_incoming, v_texCoord);
  vec2 d = abs(v_texCoord - u_center);
  float dist = d.x + d.y;
  float edge = u_progress * 1.0;
  float soft = max(u_feather, 0.001);
  float m = smoothstep(edge - soft, edge + soft, dist);
  fragColor = mix(b, a, m);
}
