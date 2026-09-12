#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  bool firstHalf = u_progress < 0.5;
  float half = firstHalf ? u_progress * 2.0 : (u_progress - 0.5) * 2.0;
  float scaleX = firstHalf ? cos(half * 1.5707963) : cos((1.0 - half) * 1.5707963);
  scaleX = max(scaleX, 0.0008);
  vec2 flippedUv = vec2((v_texCoord.x - 0.5) / scaleX + 0.5, v_texCoord.y);
  bool inBounds = flippedUv.x >= 0.0 && flippedUv.x <= 1.0;
  vec4 color = firstHalf
    ? texture(u_outgoing, clamp(flippedUv, 0.0, 1.0))
    : texture(u_incoming, clamp(flippedUv, 0.0, 1.0));
  color.rgb *= 0.6 + 0.4 * scaleX;
  fragColor = inBounds ? color : vec4(0.05, 0.05, 0.06, 1.0);
}
