#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform float u_time;
uniform float u_blockiness;

in vec2 v_texCoord;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 blockGrid = vec2(24.0, 14.0) * u_blockiness;
  vec2 block = floor(v_texCoord * blockGrid);
  float r = hash(block + floor(u_time * 8.0));
  float rSwap = hash(block * 1.7 + 3.1);
  vec2 jitter = (vec2(hash(block), hash(block + 7.0)) - 0.5) * 0.06 * step(0.6, r);
  vec2 uv = clamp(v_texCoord + jitter, 0.0, 1.0);
  vec4 a = texture(u_outgoing, uv);
  vec4 b = texture(u_incoming, uv);
  float threshold = u_progress + (rSwap - 0.5) * 0.6;
  vec4 result = threshold > 0.5 ? b : a;
  float stuck = step(0.94, r) * (1.0 - smoothstep(0.7, 1.0, u_progress));
  result = mix(result, a, stuck);
  fragColor = result;
}
