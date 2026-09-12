#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform float u_squares;

in vec2 v_texCoord;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(41.0, 289.0))) * 43758.5453);
}

void main() {
  vec4 a = texture(u_outgoing, v_texCoord);
  vec4 b = texture(u_incoming, v_texCoord);
  vec2 cell = floor(v_texCoord * u_squares);
  float parity = mod(cell.x + cell.y, 2.0);
  float stagger = hash(cell) * 0.35;
  float delay = parity * 0.15;
  float denom = max(0.001, 1.0 - stagger - delay);
  float local = clamp((u_progress - stagger - delay) / denom, 0.0, 1.0);
  float soft = 0.08;
  float m = smoothstep(0.5 - soft, 0.5 + soft, local);
  fragColor = mix(a, b, m);
}
