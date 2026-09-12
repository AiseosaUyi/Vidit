#version 300 es
precision highp float;

uniform sampler2D u_outgoing;
uniform sampler2D u_incoming;
uniform float u_progress;
uniform float u_punchAmount;

in vec2 v_texCoord;
out vec4 fragColor;

vec4 sampleZoomBlur(sampler2D tex, vec2 uv, vec2 center, float amount) {
  vec4 sum = vec4(0.0);
  const int SAMPLES = 8;
  for (int i = 0; i < SAMPLES; i++) {
    float t = float(i) / float(SAMPLES - 1);
    vec2 sampleUv = mix(uv, center + (uv - center) * (1.0 - amount), t);
    sum += texture(tex, clamp(sampleUv, 0.0, 1.0));
  }
  return sum / float(SAMPLES);
}

void main() {
  vec2 center = vec2(0.5);
  float outAmount = smoothstep(0.0, 0.6, u_progress) * u_punchAmount;
  float inAmount = (1.0 - smoothstep(0.4, 1.0, u_progress)) * u_punchAmount;
  vec2 outUv = center + (v_texCoord - center) * (1.0 + outAmount * 1.4);
  vec4 outColor = sampleZoomBlur(u_outgoing, outUv, center, outAmount);
  vec2 inUv = center + (v_texCoord - center) * (1.0 - inAmount * 0.6);
  vec4 inColor = sampleZoomBlur(u_incoming, inUv, center, inAmount);
  float m = smoothstep(0.35, 0.75, u_progress);
  fragColor = mix(outColor, inColor, m);
}
