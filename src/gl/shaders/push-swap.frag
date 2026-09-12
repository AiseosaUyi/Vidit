#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform vec2 u_dir;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  vec2 outgoingUv = v_texCoord + u_dir * u_progress;
  vec2 incomingUv = v_texCoord - u_dir * (1.0 - u_progress);
  float outgoingVisible = step(0.0, outgoingUv.x) * step(outgoingUv.x, 1.0) * step(0.0, outgoingUv.y) * step(outgoingUv.y, 1.0);
  vec4 outColor = texture(u_outgoing, clamp(outgoingUv, 0.0, 1.0));
  vec4 inColor = texture(u_incoming, clamp(incomingUv, 0.0, 1.0));
  fragColor = outgoingVisible > 0.5 ? outColor : inColor;
}
