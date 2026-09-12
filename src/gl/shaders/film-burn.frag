#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform float u_time;
uniform float u_burnIntensity;

in vec2 v_texCoord;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec4 a = texture(u_outgoing, v_texCoord);
  vec4 b = texture(u_incoming, v_texCoord);
  float peak = 1.0 - abs(u_progress * 2.0 - 1.0);
  vec4 base = mix(a, b, smoothstep(0.0, 1.0, u_progress));
  float flicker = 0.85 + 0.15 * hash(vec2(floor(u_time * 24.0), 0.0));
  vec3 burnColor = vec3(1.0, 0.72, 0.25);
  float burn = peak * u_burnIntensity * flicker;
  vec3 result = base.rgb + burnColor * burn;
  result = mix(result, vec3(1.0), peak * peak * 0.35);
  fragColor = vec4(result, base.a);
}
