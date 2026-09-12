#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform float u_feather;
uniform vec2 u_center;

in vec2 v_texCoord;
out vec4 fragColor;

// Cheap heart distance field: two round lobes + a diagonal wedge for the bottom point.
float heartDist(vec2 p) {
  p.y += 0.28;
  vec2 lobeA = p - vec2(-0.3, 0.32);
  vec2 lobeB = p - vec2(0.3, 0.32);
  float lobes = min(length(lobeA), length(lobeB)) - 0.42;
  float wedge = (abs(p.x) * 1.15 + p.y) - 0.62;
  return min(lobes, wedge);
}

void main() {
  vec4 a = texture(u_outgoing, v_texCoord);
  vec4 b = texture(u_incoming, v_texCoord);
  vec2 p = (v_texCoord - u_center) * vec2(16.0 / 9.0, 1.0);
  float grow = max(u_progress, 0.0008) * 1.9;
  float d = heartDist(p / grow) * grow;
  float soft = max(u_feather, 0.001);
  float m = smoothstep(-soft, soft, d);
  fragColor = mix(b, a, m);
}
