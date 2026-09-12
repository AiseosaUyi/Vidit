#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;

in vec2 v_texCoord;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(41.0, 289.0))) * 43758.5453);
}

void main() {
  // fine grid (crisp) at both ends, chunky mosaic blocks mid-transition
  float gridSize = mix(300.0, 14.0, sin(u_progress * 3.14159265));
  vec2 grid = floor(v_texCoord * gridSize);
  float r = hash(grid);
  vec2 cell = (grid + 0.5) / gridSize;
  vec4 a = texture(u_outgoing, cell);
  vec4 b = texture(u_incoming, cell);
  float cut = u_progress + (r - 0.5) * 0.5;
  fragColor = cut > 0.5 ? b : a;
}
