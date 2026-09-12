#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform float u_slats;
uniform float u_vertical;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  vec4 a = texture(u_outgoing, v_texCoord);
  vec4 b = texture(u_incoming, v_texCoord);
  float axis = mix(v_texCoord.y, v_texCoord.x, u_vertical);
  float slatPos = fract(axis * u_slats);
  float soft = 0.06;
  float m = smoothstep(u_progress - soft, u_progress + soft, slatPos);
  fragColor = mix(b, a, m);
}
