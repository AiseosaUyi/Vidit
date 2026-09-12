#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  float p = smoothstep(0.0, 1.0, u_progress);
  float gap = p * 0.55;
  bool leftHalf = v_texCoord.x < 0.5;
  float virtualX = leftHalf ? v_texCoord.x + gap : v_texCoord.x - gap;
  bool visible = leftHalf ? virtualX <= 0.5 : virtualX >= 0.5;
  vec2 mirrored = vec2(1.0 - virtualX, v_texCoord.y);
  vec4 outColor = texture(u_outgoing, clamp(mirrored, 0.0, 1.0));
  vec4 inColor = texture(u_incoming, v_texCoord);
  fragColor = visible ? outColor : inColor;
}
