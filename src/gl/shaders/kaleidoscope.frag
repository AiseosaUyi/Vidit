#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform float u_segments;

in vec2 v_texCoord;
out vec4 fragColor;

const float PI = 3.14159265359;

vec2 kaleido(vec2 uv, float segments, float twist) {
  vec2 centered = uv - 0.5;
  float r = length(centered);
  float ang = atan(centered.y, centered.x) + twist;
  float wedge = PI * 2.0 / segments;
  ang = mod(ang, wedge);
  ang = abs(ang - wedge * 0.5);
  return vec2(cos(ang), sin(ang)) * r + 0.5;
}

void main() {
  float twist = u_progress * 1.4;
  float segments = mix(3.0, u_segments, smoothstep(0.0, 1.0, u_progress));
  vec2 uvA = kaleido(v_texCoord, segments, twist);
  vec2 uvB = kaleido(v_texCoord, segments, -twist);
  vec4 a = texture(u_outgoing, clamp(uvA, 0.0, 1.0));
  vec4 b = texture(u_incoming, clamp(uvB, 0.0, 1.0));
  float m = smoothstep(0.15, 0.85, u_progress);
  fragColor = mix(a, b, m);
}
