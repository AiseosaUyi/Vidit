#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform vec2 u_dir;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  vec2 shifted = v_texCoord + u_progress * u_dir;
  vec2 wrapped = fract(shifted);
  vec4 outgoingColor = texture(u_outgoing, wrapped);
  vec4 incomingColor = texture(u_incoming, wrapped);
  float outgoingVisible = step(0.0, shifted.x) * step(shifted.x, 1.0) * step(0.0, shifted.y) * step(shifted.y, 1.0);
  fragColor = mix(incomingColor, outgoingColor, outgoingVisible);
}
