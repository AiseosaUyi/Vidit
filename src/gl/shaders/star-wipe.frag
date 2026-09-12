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
  vec2 d = v_texCoord - u_center;
  d.x *= 16.0 / 9.0;
  float r = length(d);
  float ang = atan(d.y, d.x);
  float starMod = 0.55 + 0.45 * cos(ang * 5.0);
  float threshold = u_progress * 1.1 * starMod;
  float soft = max(u_feather, 0.001);
  float m = smoothstep(threshold - soft, threshold + soft, r);
  fragColor = mix(b, a, m);
}
