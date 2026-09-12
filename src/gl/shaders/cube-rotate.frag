#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;

in vec2 v_texCoord;
out vec4 fragColor;

void main() {
  float outDepth = cos(u_progress * 1.5707963);
  vec2 outUv = vec2((v_texCoord.x - 1.0) / max(outDepth, 0.0001) + 1.0, v_texCoord.y);
  float outVisible = step(0.0, outDepth) * step(0.0, outUv.x) * step(outUv.x, 1.0);
  vec4 outColor = texture(u_outgoing, clamp(outUv, 0.0, 1.0));

  float inDepth = cos((1.0 - u_progress) * 1.5707963);
  vec2 inUv = vec2(v_texCoord.x / max(inDepth, 0.0001), v_texCoord.y);
  float inVisible = step(0.0, inDepth) * step(0.0, inUv.x) * step(inUv.x, 1.0);
  vec4 inColor = texture(u_incoming, clamp(inUv, 0.0, 1.0));

  outColor.rgb *= mix(1.0, 0.55, u_progress);
  inColor.rgb *= mix(0.55, 1.0, u_progress);

  fragColor = outVisible > 0.5 ? outColor : (inVisible > 0.5 ? inColor : vec4(0.04, 0.04, 0.05, 1.0));
}
