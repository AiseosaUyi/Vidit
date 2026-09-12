#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform vec2 u_center;

in vec2 v_texCoord;
out vec4 fragColor;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

void main() {
  vec4 a = texture(u_outgoing, v_texCoord);
  vec4 b = texture(u_incoming, v_texCoord);
  vec2 d = v_texCoord - u_center;
  d.x *= 16.0 / 9.0;
  float ang = atan(d.y, d.x) + PI * 0.5;
  ang = mod(ang, TAU);
  float sweep = u_progress * TAU;
  float soft = 0.02;
  float m = smoothstep(sweep - soft, sweep + soft, ang);
  fragColor = mix(b, a, m);
}
