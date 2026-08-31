/**
 * Pixelfy Web — WebGL2 ping-pong render pipeline.
 *
 * Chain per render:  [source] → geometry (crop/rotate/flip) → op passes → result
 * "Before" and "After" chains render into persistent result slots so the compose
 * pass can show either / split between them.
 *
 * Convention: all textures are MEMORY-TOP-DOWN (uploaded without FLIP_Y).
 * Passes sample/write with identity v_uv, so orientation only matters at
 * compose/readback where it is handled explicitly.
 */
import { fragmentOf, VERT } from './glsl';
import type { OpStates } from './ops';
import { activeOps } from './ops';

export interface GeoState {
  rot: 0 | 1 | 2 | 3;      // clockwise quarter-turns
  flipH: boolean;
  flipV: boolean;
  crop: { x: number; y: number; w: number; h: number }; // display-space fractions
}

export const DEFAULT_GEO: GeoState = { rot: 0, flipH: false, flipV: false, crop: { x: 0, y: 0, w: 1, h: 1 } };

interface Slot { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number }

export interface ChainResult { w: number; h: number; slot: Slot }

const PREVIEW_MAX = 1800;

export class RenderEngine {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private programs = new Map<string, WebGLProgram>();
  private vao: WebGLVertexArrayObject | null = null;
  private src: Slot | null = null;
  private slots: Record<string, Slot> = {};
  private glBg: [number, number, number] = [0.078, 0.071, 0.063];
  private glAccent: [number, number, number] = [1.0, 0.69, 0.125];
  readonly maxTex: number;

  /** theme colours for GPU-drawn UI (canvas backdrop + split divider) */
  setTheme(bg: [number, number, number], accent: [number, number, number]) {
    this.glBg = bg;
    this.glAccent = accent;
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      antialias: false, depth: false, stencil: false, alpha: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error('WebGL2 is not available in this browser.');
    this.gl = gl;
    this.maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  // ---------- program management ----------
  private program(name: string): WebGLProgram {
    const cached = this.programs.get(name);
    if (cached) return cached;
    const gl = this.gl;
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh);
        throw new Error(`shader ${name} failed: ${log}`);
      }
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragmentOf(name)));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(`link ${name} failed: ${gl.getProgramInfoLog(prog)}`);
    }
    this.programs.set(name, prog);
    return prog;
  }

  // ---------- slot (target texture) management ----------
  private makeSlot(w: number, h: number): Slot {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex, fbo, w, h };
  }

  private ensureSlot(key: string, w: number, h: number): Slot {
    const s = this.slots[key];
    if (s && s.w === w && s.h === h) return s;
    if (s) {
      this.gl.deleteTexture(s.tex);
      this.gl.deleteFramebuffer(s.fbo);
    }
    const slot = this.makeSlot(w, h);
    this.slots[key] = slot;
    return slot;
  }

  // ---------- image ----------
  setImage(bitmap: ImageBitmap, w: number, h: number) {
    const gl = this.gl;
    if (this.src) { gl.deleteTexture(this.src.tex); gl.deleteFramebuffer(this.src.fbo); }
    const slot = this.makeSlot(w, h);
    gl.bindTexture(gl.TEXTURE_2D, slot.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
    this.src = slot;
  }

  get imageSize() {
    return this.src ? { w: this.src.w, h: this.src.h } : null;
  }

  /** px size after geometry (crop in display space; rotation swaps dims) */
  geoSize(srcW: number, srcH: number, geo: GeoState) {
    const dW = geo.rot % 2 === 1 ? srcH : srcW;
    const dH = geo.rot % 2 === 1 ? srcW : srcH;
    return {
      w: Math.max(1, Math.round(geo.crop.w * dW)),
      h: Math.max(1, Math.round(geo.crop.h * dH)),
    };
  }

  // ---------- rendering ----------
  private runPass(opts: {
    shader: string;
    target: Slot;
    viewW: number; viewH: number;    // region of target written
    srcTex: WebGLTexture;
    srcW: number; srcH: number;
    uniforms?: Record<string, number | number[]>;
    blendTex?: WebGLTexture;
  }) {
    const gl = this.gl;
    const prog = this.program(opts.shader);
    gl.bindFramebuffer(gl.FRAMEBUFFER, opts.target.fbo);
    gl.viewport(0, 0, opts.viewW, opts.viewH);
    gl.useProgram(prog);
    gl.bindVertexArray(this.vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, opts.srcTex);
    gl.uniform1i(gl.getUniformLocation(prog, 'u_tex'), 0);
    const setU = (n: string, v: number | number[]) => {
      const loc = gl.getUniformLocation(prog, n);
      if (!loc) return;
      if (Array.isArray(v)) {
        if (v.length === 2) gl.uniform2f(loc, v[0], v[1]);
        else if (v.length === 4) gl.uniform4f(loc, v[0], v[1], v[2], v[3]);
      } else {
        if (n === 'u_rot' || n === 'u_showBefore') gl.uniform1i(loc, v);
        else gl.uniform1f(loc, v);
      }
    };
    if (opts.blendTex) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, opts.blendTex);
      gl.uniform1i(gl.getUniformLocation(prog, 'u_tex2'), 1);
    }
    setU('u_res', [opts.viewW, opts.viewH]);
    setU('u_srcRes', [opts.srcW, opts.srcH]);
    if (opts.uniforms) for (const [k, v] of Object.entries(opts.uniforms)) setU(k, v);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /**
   * Render the full chain. Returns { after, before, w, h } in persistent slots
   * sized (potentially capped for preview) — exportPath=false clamps to PREVIEW_MAX.
   */
  renderChain(states: OpStates, geo: GeoState, maxDim = PREVIEW_MAX): { after: Slot; before: Slot; w: number; h: number } {
    if (!this.src) throw new Error('no image');
    const full = this.geoSize(this.src.w, this.src.h, geo);
    const scale = Math.min(1, maxDim / Math.max(full.w, full.h));
    const W = Math.max(1, Math.round(full.w * scale));
    const H = Math.max(1, Math.round(full.h * scale));

    const A = this.ensureSlot('A', W, H);
    const B = this.ensureSlot('B', W, H);
    const C = this.ensureSlot('C', Math.max(1, W >> 1), Math.max(1, H >> 1));
    const D = this.ensureSlot('D', Math.max(1, W >> 1), Math.max(1, H >> 1));
    const RA = this.ensureSlot('RA', W, H);
    const RB = this.ensureSlot('RB', W, H);

    const chain = (ops: ReturnType<typeof activeOps>, out: Slot) => {
      // geometry first — full res
      this.runPass({
        shader: 'geometry', target: A, viewW: W, viewH: H,
        srcTex: this.src!.tex, srcW: this.src!.w, srcH: this.src!.h,
        uniforms: {
          u_crop: [geo.crop.x, geo.crop.y, geo.crop.w, geo.crop.h],
          u_flip: [geo.flipH ? -1 : 1, geo.flipV ? -1 : 1],
          u_rot: geo.rot,
        },
      });
      let cur: Slot = A;
      for (const op of ops) {
        const opInputTex = cur.tex;
        for (const pass of op.def.passes) {
          const s = pass.scale ?? 1;
          // full-res passes ping-pong A/B; half-res passes ping-pong C/D
          const target: Slot = s === 1 ? (cur === A ? B : A) : (cur === C ? D : C);
          const viewW = s === 1 ? W : C.w;
          const viewH = s === 1 ? H : C.h;
          this.runPass({
            shader: pass.shader,
            target, viewW, viewH,
            srcTex: cur.tex, srcW: cur.w, srcH: cur.h,
            uniforms: pass.uniforms ? pass.uniforms(op.values, { w: viewW, h: viewH }) : undefined,
            blendTex: pass.blendWithInput ? opInputTex : undefined,
          });
          cur = target;
        }
        // op must finish full-res: half-res chains always end back in A or B via a
        // scale-1 composite pass (see bloom), so cur is guaranteed W×H here.
        if (s_isHalf(cur)) throw new Error(`op ${op.def.id} ended at half resolution`);
      }
      // blit result into persistent output slot
      const gl = this.gl;
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, cur.fbo);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, out.fbo);
      gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT, gl.NEAREST);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const s_isHalf = (slot: Slot) => slot === C || slot === D;

    chain([], RB);                 // before = geometry only
    chain(activeOps(states), RA);  // after
    return { after: RA, before: RB, w: W, h: H };
  }

  /** Draw to the visible canvas. view = top-down px rect of the drawn image inside canvas. */
  present(result: { after: Slot; before: Slot; w: number; h: number }, view: { x: number; y: number; w: number; h: number }, split: number, showBefore: boolean) {
    const gl = this.gl;
    const cw = this.canvas.width, ch = this.canvas.height;
    const prog = this.program('compose');
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, cw, ch);
    gl.useProgram(prog);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, result.after.tex);
    gl.uniform1i(gl.getUniformLocation(prog, 'u_after'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, result.before.tex);
    gl.uniform1i(gl.getUniformLocation(prog, 'u_before'), 1);
    gl.uniform1f(gl.getUniformLocation(prog, 'u_split'), split);
    gl.uniform1i(gl.getUniformLocation(prog, 'u_showBefore'), showBefore ? 1 : 0);
    gl.uniform3f(gl.getUniformLocation(prog, 'u_bg'), this.glBg[0], this.glBg[1], this.glBg[2]);
    gl.uniform3f(gl.getUniformLocation(prog, 'u_div'), this.glAccent[0], this.glAccent[1], this.glAccent[2]);
    // convert top-down view rect → GL bottom-up
    gl.uniform4f(gl.getUniformLocation(prog, 'u_view'), view.x, ch - view.y - view.h, view.w, view.h);
    gl.uniform2f(gl.getUniformLocation(prog, 'u_canvas'), cw, ch);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  clearCanvas() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(this.glBg[0], this.glBg[1], this.glBg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  /** Full-res render → Blob. Re-renders the chain at (capped) native resolution. */
  async exportBlob(states: OpStates, geo: GeoState, fmt: 'jpeg' | 'png' | 'webp', quality: number, maxDim: number): Promise<{ blob: Blob; w: number; h: number }> {
    if (!this.src) throw new Error('no image');
    const cap = Math.min(maxDim, this.maxTex);
    const res = this.renderChain(states, geo, cap);
    const { w, h } = res;
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, res.after.fbo);
    const pixels = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // flip rows (readPixels is bottom-up; our texture memory is top-down)
    const rowBytes = w * 4;
    const flipped = new Uint8ClampedArray(pixels.length);
    for (let y = 0; y < h; y++) {
      flipped.set(pixels.subarray((h - 1 - y) * rowBytes, (h - y) * rowBytes), y * rowBytes);
    }
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const ctx = off.getContext('2d')!;
    ctx.putImageData(new ImageData(flipped, w, h), 0, 0);
    const blob = await new Promise<Blob | null>((res2) => off.toBlob(res2, `image/${fmt}`, quality));
    if (!blob) throw new Error('export failed');
    return { blob, w, h };
  }

  /** 64-bin RGB+luma histogram from the current AFTER texture. */
  histogram(result: { after: Slot; w: number; h: number }) {
    const gl = this.gl;
    const s = Math.min(1, 256 / Math.max(result.w, result.h));
    const w = Math.max(1, Math.round(result.w * s));
    const h = Math.max(1, Math.round(result.h * s));
    const tmp = this.ensureSlot('hist', w, h);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, result.after.fbo);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, tmp.fbo);
    gl.blitFramebuffer(0, 0, result.w, result.h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.LINEAR);
    gl.bindFramebuffer(gl.FRAMEBUFFER, tmp.fbo);
    const px = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const BINS = 64;
    const r = new Uint32Array(BINS), g = new Uint32Array(BINS), b = new Uint32Array(BINS), l = new Uint32Array(BINS);
    for (let i = 0; i < px.length; i += 4) {
      const R = px[i], G = px[i + 1], Bv = px[i + 2];
      r[(R * BINS / 256) | 0]++; g[(G * BINS / 256) | 0]++; b[(Bv * BINS / 256) | 0]++;
      l[(((0.2126 * R + 0.7152 * G + 0.0722 * Bv) | 0) * BINS / 256) | 0]++;
    }
    return { r, g, b, l };
  }
}
