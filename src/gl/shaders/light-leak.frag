#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform vec3 u_leakColor;
uniform float u_intensity;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  vec4 a = texture(u_outgoing, v_texCoord);
  vec4 b = texture(u_incoming, v_texCoord);
  vec4 base = mix(a, b, smoothstep(0.0, 1.0, u_progress));
  float sweep = v_texCoord.x * 0.7 + v_texCoord.y * 0.3;
  float pos = u_progress * 1.6 - 0.3;
  float band = 1.0 - smoothstep(0.0, 0.45, abs(sweep - pos));
  float peak = 1.0 - abs(u_progress * 2.0 - 1.0);
  vec3 leak = u_leakColor * band * u_intensity * peak;
  fragColor = vec4(base.rgb + leak, base.a);
}
