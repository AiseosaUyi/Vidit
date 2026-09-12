#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform float u_swirlAmount;

in vec2 v_texCoord;
out vec4 fragColor;

vec2 swirl(vec2 uv, float amount) {
  vec2 center = vec2(0.5);
  vec2 d = uv - center;
  float aspect = 16.0 / 9.0;
  d.x *= aspect;
  float r = length(d);
  float angle = amount * smoothstep(0.9, 0.0, r);
  float s = sin(angle);
  float c = cos(angle);
  vec2 rotated = vec2(d.x * c - d.y * s, d.x * s + d.y * c);
  rotated.x /= aspect;
  return rotated + center;
}

void main() {
  float peak = 1.0 - abs(u_progress * 2.0 - 1.0);
  float amount = peak * u_swirlAmount;
  vec2 outUv = swirl(v_texCoord, amount);
  vec2 inUv = swirl(v_texCoord, -amount);
  vec4 a = texture(u_outgoing, clamp(outUv, 0.0, 1.0));
  vec4 b = texture(u_incoming, clamp(inUv, 0.0, 1.0));
  float m = smoothstep(0.3, 0.7, u_progress);
  fragColor = mix(a, b, m);
}
