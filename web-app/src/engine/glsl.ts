/**
 * Pixelfy Web — shader registry.
 * Every adjustment is a small GLSL ES 3.00 fragment program executed as a
 * full-frame pass in a ping-pong pipeline (see pipeline.ts).
 * Ops mirror the Android RenderEngine/OpType set so the two stay conceptually in sync.
 */

export const VERT = `#version 300 es
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_tex;
uniform vec2 u_res;      // target resolution (px)
uniform vec2 u_srcRes;   // source image resolution (px)

float lum(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

vec3 hsl2rgb(vec3 hsl) {
  float h = hsl.x, s = hsl.y, l = hsl.z;
  vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;

/** Geometry pass (always runs first): crop rect in display space + flip + 90° rotations. */
const geometry = `
uniform vec4 u_crop;   // x, y, w, h (fractions of DISPLAY dims, post-rotation)
uniform vec2 u_flip;   // ±1
uniform int u_rot;     // 0..3 clockwise steps
void main() {
  vec2 du = u_crop.xy + v_uv * u_crop.zw;
  if (u_flip.x < 0.0) du.x = 1.0 - du.x;
  if (u_flip.y < 0.0) du.y = 1.0 - du.y;
  vec2 suv = u_rot == 1 ? vec2(du.y, 1.0 - du.x)
           : u_rot == 2 ? vec2(1.0 - du.x, 1.0 - du.y)
           : u_rot == 3 ? vec2(1.0 - du.y, du.x)
           : du;
  outColor = texture(u_tex, suv);
}`;

// ---------------- LIGHT ----------------

const exposure = `
uniform float u_ev;
void main() {
  vec4 c = texture(u_tex, v_uv);
  outColor = vec4(c.rgb * exp2(u_ev), c.a);
}`;

const brightness = `
uniform float u_value;
void main() {
  vec4 c = texture(u_tex, v_uv);
  vec3 rgb = c.rgb + u_value * 0.5;
  outColor = vec4(clamp(rgb, 0.0, 1.0), c.a);
}`;

const contrast = `
uniform float u_amount;
void main() {
  vec4 c = texture(u_tex, v_uv);
  float k = 1.0 + u_amount;
  // pivot around mid grey, keep blacks anchored a bit for a filmic feel
  vec3 rgb = (c.rgb - 0.42) * k + 0.42;
  outColor = vec4(clamp(rgb, 0.0, 1.0), c.a);
}`;

const highlights = `
uniform float u_amount;      // -1..1 (negative recovers highlights)
void main() {
  vec4 c = texture(u_tex, v_uv);
  float l = lum(c.rgb);
  float mask = smoothstep(0.45, 1.0, l);
  vec3 rgb = c.rgb * (1.0 + u_amount * mask * 0.9);
  outColor = vec4(clamp(rgb, 0.0, 1.0), c.a);
}`;

const shadows = `
uniform float u_amount;      // -1..1 (positive lifts shadows)
void main() {
  vec4 c = texture(u_tex, v_uv);
  float l = lum(c.rgb);
  float mask = smoothstep(0.55, 0.0, l);
  vec3 rgb = c.rgb + u_amount * mask * 0.6 * (0.25 + 0.75 * (1.0 - l));
  outColor = vec4(clamp(rgb, 0.0, 1.0), c.a);
}`;

const whitesBlacks = `
uniform float u_whites;      // -1..1
uniform float u_blacks;      // -1..1
void main() {
  vec4 c = texture(u_tex, v_uv);
  vec3 rgb = c.rgb;
  // black point: + crushes blacks, - lifts them
  float bp = max(u_blacks, 0.0) * 0.35;
  float lift = max(-u_blacks, 0.0) * 0.30;
  rgb = rgb * (1.0 - lift) + lift * vec3(0.06 + 0.5 * lum(rgb) * 0.5);
  // white point: + pulls white point down (brighter whites), - dulls whites
  float wp = max(u_whites, 0.0) * 0.35;
  float dim = max(-u_whites, 0.0) * 0.35;
  rgb = clamp((rgb - bp) / max(1.0 - bp - wp, 1e-3), 0.0, 1.0) * (1.0 - dim);
  outColor = vec4(clamp(rgb, 0.0, 1.0), c.a);
}`;

const gamma = `
uniform float u_gamma;
void main() {
  vec4 c = texture(u_tex, v_uv);
  outColor = vec4(pow(max(c.rgb, 0.0), vec3(1.0 / max(u_gamma, 0.05))), c.a);
}`;

const fade = `
uniform float u_amount;      // 0..1 film fade
void main() {
  vec4 c = texture(u_tex, v_uv);
  vec3 rgb = c.rgb;
  rgb = mix(rgb, 1.0 - rgb, 0.0); // noop guard
  float l = lum(rgb);
  // lift black point, pull white point, slight desat + warm shift
  rgb = rgb * (1.0 - 0.22 * u_amount) + 0.075 * u_amount;
  rgb = mix(rgb, vec3(lum(rgb)), 0.28 * u_amount);
  rgb += vec3(0.02, 0.01, -0.015) * u_amount;
  outColor = vec4(clamp(rgb, 0.0, 1.0), c.a);
}`;

// ---------------- COLOR ----------------

const saturation = `
uniform float u_sat;         // -1..1
void main() {
  vec4 c = texture(u_tex, v_uv);
  float l = lum(c.rgb);
  outColor = vec4(clamp(mix(vec3(l), c.rgb, 1.0 + u_sat), 0.0, 1.0), c.a);
}`;

const vibrance = `
uniform float u_vib;         // -1..1
void main() {
  vec4 c = texture(u_tex, v_uv);
  float l = lum(c.rgb);
  float s = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
  float w = 1.0 - clamp(s, 0.0, 1.0);              // boost dull pixels more
  float amt = u_vib >= 0.0 ? u_vib * w : u_vib;
  outColor = vec4(clamp(mix(vec3(l), c.rgb, 1.0 + amt), 0.0, 1.0), c.a);
}`;

const temperature = `
uniform float u_temp;        // -1..1 (blue..amber)
uniform float u_tint;        // -1..1 (green..magenta)
void main() {
  vec4 c = texture(u_tex, v_uv);
  vec3 rgb = c.rgb;
  rgb.r *= 1.0 + u_temp * 0.14;
  rgb.b *= 1.0 - u_temp * 0.14;
  rgb.g *= 1.0 + u_tint * 0.10;
  outColor = vec4(clamp(rgb, 0.0, 1.0), c.a);
}`;

const hueShift = `
uniform float u_deg;         // -180..180
void main() {
  vec4 c = texture(u_tex, v_uv);
  float a = radians(u_deg);
  const vec3 k = vec3(0.57735);
  float cosA = cos(a);
  c.rgb = c.rgb * cosA + cross(k, c.rgb) * sin(a) + k * dot(k, c.rgb) * (1.0 - cosA);
  outColor = vec4(clamp(c.rgb, 0.0, 1.0), c.a);
}`;

const sepia = `
uniform float u_amount;
void main() {
  vec4 c = texture(u_tex, v_uv);
  float l = lum(c.rgb);
  vec3 sep = vec3(l) * vec3(1.18, 0.99, 0.78);
  outColor = vec4(clamp(mix(c.rgb, sep, u_amount), 0.0, 1.0), c.a);
}`;

const blackWhite = `
uniform float u_amount;
void main() {
  vec4 c = texture(u_tex, v_uv);
  float l = lum(c.rgb);
  // gentle contrast S-curve for a filmic mono
  float m = smoothstep(0.0, 1.0, l);
  l = mix(l, m, 0.35);
  outColor = vec4(mix(c.rgb, vec3(l), u_amount), c.a);
}`;

const invert = `
void main() {
  vec4 c = texture(u_tex, v_uv);
  outColor = vec4(1.0 - c.rgb, c.a);
}`;

const dehaze = `
uniform float u_amount;      // -1..1
void main() {
  vec4 c = texture(u_tex, v_uv);
  float l = lum(c.rgb);
  float haze = u_amount * (1.0 - l) * 0.45;
  vec3 rgb;
  if (u_amount >= 0.0) {
    rgb = (c.rgb - vec3(0.62, 0.68, 0.75) * haze) / max(1.0 - haze * 0.7, 1e-3);
    float ll = lum(rgb);
    rgb = mix(vec3(ll), rgb, 1.0 + u_amount * 0.25);
    rgb = (rgb - 0.5) * (1.0 + u_amount * 0.18) + 0.5;
  } else {
    rgb = mix(c.rgb, vec3(0.72, 0.78, 0.85), -u_amount * 0.5);
  }
  outColor = vec4(clamp(rgb, 0.0, 1.0), c.a);
}`;

const splitTone = `
uniform float u_shHue;       // 0..360
uniform float u_shSat;       // 0..1
uniform float u_hiHue;
uniform float u_hiSat;
uniform float u_balance;     // -1..1
void main() {
  vec4 c = texture(u_tex, v_uv);
  float l = lum(c.rgb);
  vec3 sh = hsl2rgb(vec3(u_shHue / 360.0, clamp(u_shSat, 0.0, 1.0), 0.5));
  vec3 hi = hsl2rgb(vec3(u_hiHue / 360.0, clamp(u_hiSat, 0.0, 1.0), 0.5));
  float t = smoothstep(0.25 + u_balance * 0.3, 0.75 + u_balance * 0.3, l);
  vec3 tintC = mix(sh, hi, t);
  // shift chroma of the image toward the tint colour, luma preserved
  vec3 toned = c.rgb + (tintC - 0.5) * (0.5 - abs(l - 0.5)) * 2.0 * max(u_shSat * (1.0 - t), u_hiSat * t);
  outColor = vec4(clamp(toned, 0.0, 1.0), c.a);
}`;

// ---------------- DETAIL ----------------

const sharpen = `
uniform float u_amount;      // 0..2
uniform float u_radius;      // texel multiplier
void main() {
  vec2 px = u_radius / u_res;
  vec3 c = texture(u_tex, v_uv).rgb;
  vec3 blur = texture(u_tex, v_uv + vec2( px.x,  0.0)).rgb
            + texture(u_tex, v_uv + vec2(-px.x,  0.0)).rgb
            + texture(u_tex, v_uv + vec2(0.0,  px.y)).rgb
            + texture(u_tex, v_uv + vec2(0.0, -px.y)).rgb;
  blur *= 0.25;
  outColor = vec4(clamp(c + (c - blur) * u_amount, 0.0, 1.0), 1.0);
}`;

const clarity = `
uniform float u_amount;      // -1..1
uniform float u_radius;      // texels (wide)
void main() {
  vec2 px = u_radius / u_res;
  vec3 c = texture(u_tex, v_uv).rgb;
  float center = lum(c);
  float blur = lum(texture(u_tex, v_uv + vec2( px.x,  px.y)).rgb)
             + lum(texture(u_tex, v_uv + vec2(-px.x,  px.y)).rgb)
             + lum(texture(u_tex, v_uv + vec2( px.x, -px.y)).rgb)
             + lum(texture(u_tex, v_uv + vec2(-px.x, -px.y)).rgb);
  blur *= 0.25;
  float local = (center - blur) * u_amount * 1.6;
  outColor = vec4(clamp(c + local, 0.0, 1.0), 1.0);
}`;

// ---------------- BLUR ----------------

const blurDir = `
uniform vec2 u_dir;          // direction in uv (per texel * radius)
uniform float u_radius;      // px
void main() {
  vec2 stepv = u_dir * (u_radius / 8.0);
  vec3 acc = texture(u_tex, v_uv).rgb * 0.227;
  acc += (texture(u_tex, v_uv + stepv * 1.0).rgb + texture(u_tex, v_uv - stepv * 1.0).rgb) * 0.194;
  acc += (texture(u_tex, v_uv + stepv * 2.4).rgb + texture(u_tex, v_uv - stepv * 2.4).rgb) * 0.121;
  acc += (texture(u_tex, v_uv + stepv * 4.0).rgb + texture(u_tex, v_uv - stepv * 4.0).rgb) * 0.054;
  acc += (texture(u_tex, v_uv + stepv * 5.6).rgb + texture(u_tex, v_uv - stepv * 5.6).rgb) * 0.016;
  outColor = vec4(acc, 1.0);
}`;

const motionBlur = `
uniform float u_angle;       // degrees
uniform float u_distance;    // px
void main() {
  vec2 dir = vec2(cos(radians(u_angle)), sin(radians(u_angle))) / u_res * u_distance;
  vec3 acc = vec3(0.0);
  for (int i = -4; i <= 4; i++) {
    acc += texture(u_tex, v_uv + dir * float(i) / 4.0).rgb;
  }
  outColor = vec4(acc / 9.0, 1.0);
}`;

const radialBlur = `
uniform float u_strength;    // 0..1 zoom blur
// centred zoom blur
void main() {
  vec2 c = vec2(0.5);
  vec3 acc = vec3(0.0);
  float total = 0.0;
  for (int i = 0; i < 16; i++) {
    float t = float(i) / 15.0;
    float s = 1.0 - u_strength * 0.35 * t;
    float w = 1.0 - t * 0.5;
    acc += texture(u_tex, c + (v_uv - c) * s).rgb * w;
    total += w;
  }
  outColor = vec4(acc / total, 1.0);
}`;

// ---------------- EFFECTS ----------------

const vignette = `
uniform float u_amount;      // -1..1 (negative = dark)
uniform float u_midpoint;    // 0..1
uniform float u_feather;     // 0.01..1
void main() {
  vec4 c = texture(u_tex, v_uv);
  vec2 d = v_uv - 0.5;
  d.x *= u_res.x / u_res.y;
  float dist = length(d) * 1.4142;
  float m = smoothstep(u_midpoint, u_midpoint + max(u_feather, 0.01), dist);
  vec3 rgb = c.rgb;
  if (u_amount < 0.0) rgb *= 1.0 + u_amount * m;
  else rgb = mix(rgb, vec3(1.0), u_amount * m);
  outColor = vec4(clamp(rgb, 0.0, 1.0), c.a);
}`;

const grain = `
uniform float u_amount;      // 0..1
uniform float u_size;        // grain cell size (px-ish)
uniform float u_seed;
void main() {
  vec4 c = texture(u_tex, v_uv);
  vec2 p = v_uv * u_res / max(u_size, 0.5);
  float n = hash12(floor(p) + fract(u_seed) * 173.13) - 0.5;
  float l = lum(c.rgb);
  float w = u_amount * (0.35 + 0.65 * (1.0 - abs(l * 2.0 - 1.0))); // strongest in mids
  outColor = vec4(clamp(c.rgb + n * w * 0.55, 0.0, 1.0), c.a);
}`;

const bloomBright = `
uniform float u_threshold;   // 0..1
void main() {
  vec3 c = texture(u_tex, v_uv).rgb;
  float l = lum(c);
  float k = smoothstep(u_threshold, u_threshold + 0.25, l);
  outColor = vec4(c * k, 1.0);
}`;

const bloomCombine = `
uniform sampler2D u_tex2;    // original input to the op
uniform float u_intensity;
void main() {
  vec3 blur = texture(u_tex, v_uv).rgb;
  vec3 orig = texture(u_tex2, v_uv).rgb;
  // screen blend
  vec3 rgb = 1.0 - (1.0 - orig) * (1.0 - blur * u_intensity);
  outColor = vec4(clamp(rgb, 0.0, 1.0), 1.0);
}`;

const chromatic = `
uniform float u_amount;      // -1..1
void main() {
  vec2 d = (v_uv - 0.5) * u_amount * 0.02;
  float r = texture(u_tex, v_uv - d).r;
  vec2 gb = v_uv;
  float g = texture(u_tex, gb).g;
  float b = texture(u_tex, v_uv + d).b;
  float a = texture(u_tex, v_uv).a;
  outColor = vec4(r, g, b, a);
}`;

/** Screen compose pass: after (+optional before split) with view transform baked in frag space. */
const compose = `
uniform sampler2D u_after;
uniform sampler2D u_before;
uniform float u_split;       // -1 disables split; else image-space x of divider
uniform int u_showBefore;    // swap whole view
uniform vec4 u_view;         // offset.xy (canvas px), size.zw (canvas px) of drawn image rect
uniform vec2 u_canvas;       // canvas px
uniform vec3 u_bg;           // theme backdrop colour
uniform vec3 u_div;          // theme accent colour (divider)
void main() {
  vec2 frag = v_uv * u_canvas;
  vec2 uv = (frag - u_view.xy) / u_view.zw;
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) {
    outColor = vec4(u_bg, 1.0);
    return;
  }
  uv.y = 1.0 - uv.y; // canvas Y is top-down
  bool before = (u_showBefore == 1) || (u_split >= 0.0 && uv.x < u_split);
  vec4 col = before ? texture(u_before, uv) : texture(u_after, uv);
  // divider line
  if (u_split >= 0.0) {
    float px = 1.5 / u_view.z;
    if (abs(uv.x - u_split) < px) col.rgb = u_div;
  }
  outColor = col;
}`;

export const SHADERS: Record<string, string> = {
  geometry,
  exposure,
  brightness,
  contrast,
  highlights,
  shadows,
  whitesBlacks,
  gamma,
  fade,
  saturation,
  vibrance,
  temperature,
  hueShift,
  sepia,
  blackWhite,
  invert,
  dehaze,
  splitTone,
  sharpen,
  clarity,
  blurDir,
  motionBlur,
  radialBlur,
  vignette,
  grain,
  bloomBright,
  bloomCombine,
  chromatic,
  compose,
};

export function fragmentOf(name: string): string {
  const body = SHADERS[name];
  if (!body) throw new Error(`unknown shader: ${name}`);
  return HEAD + body;
}
