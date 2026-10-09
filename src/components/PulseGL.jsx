import { useEffect, useRef } from "react";

/* Brain² pulse, drawn in WebGL: a soft ClickUp-gradient core that breathes, and on every beat a shockwave
   ring that rushes out, wobbles with noise and fades. The rings are squashed so they read as lying on the
   isometric pedestal. Falls back to nothing (the mark still shows) when WebGL is not there. */
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uBeat;   // seconds since the last beat
// ClickUp gradient: blue → purple → pink → orange, looped
vec3 brand(float x){
  x = fract(x);
  vec3 b = vec3(0.0, 0.569, 1.0), v = vec3(0.4, 0.278, 0.941), k = vec3(1.0, 0.008, 0.941), o = vec3(0.988, 0.427, 0.176);
  if (x < 0.25) return mix(b, v, x * 4.0);
  if (x < 0.5)  return mix(v, k, (x - 0.25) * 4.0);
  if (x < 0.75) return mix(k, o, (x - 0.5) * 4.0);
  return mix(o, b, (x - 0.75) * 4.0);
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
float ring(float r, float R, float w){ float d = (r - R) / w; return exp(-d * d); }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * uRes.y);
  vec2 q = vec2(uv.x, uv.y * 1.8);            // squash: rings lie on the pedestal
  float r = length(q);
  float a = atan(q.y, q.x) / 6.2831853;
  float n = noise(vec2(a * 9.0, uTime * 0.6)) - 0.5;

  // breathing core glow behind the mark
  float breathe = 0.85 + 0.15 * sin(uTime * 1.6);
  float core = exp(-r * r * 7.0) * 0.22 * breathe;

  // beat shockwave: fast out, ease-out, fades as it travels
  float t = uBeat;
  float R1 = 0.18 + 0.85 * (1.0 - exp(-t * 2.4));
  float f1 = exp(-t * 1.25);
  float w1 = 0.02 + 0.05 * t;
  float wave = ring(r + n * 0.05 * (0.3 + t), R1, w1) * f1 * 0.3;
  // a second, softer echo just behind it
  float R2 = 0.14 + 0.7 * (1.0 - exp(-max(t - 0.18, 0.0) * 2.2));
  float wave2 = ring(r + n * 0.07, R2, 0.05 + 0.04 * t) * exp(-t * 1.6) * step(0.18, t) * 0.25;

  // idle ripples that keep it alive between beats
  float idle = 0.0;
  for (int i = 0; i < 3; i++) {
    float ph = fract(uTime * 0.22 + float(i) / 3.0);
    idle += ring(r + n * 0.03, 0.2 + ph * 0.75, 0.012 + ph * 0.03) * (1.0 - ph) * (1.0 - ph) * 0.08;
  }

  float hue = a + uTime * 0.08 + r * 0.35;
  vec3 col = brand(hue);
  float alpha = clamp(core + wave + wave2 + idle, 0.0, 0.45);
  // brighter, whiter crest on the main wave
  col = mix(col, vec3(1.0), clamp(wave * 0.2, 0.0, 0.2));
  // fade out at the canvas edge
  alpha *= smoothstep(1.0, 0.75, length(uv));
  gl_FragColor = vec4(col * alpha, alpha);
}`;

export default function PulseGL({ beat, className = "" }) {
  const ref = useRef(null);
  const beatAt = useRef(performance.now());
  useEffect(() => { beatAt.current = performance.now(); }, [beat]);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) return;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes"), uTime = gl.getUniformLocation(prog, "uTime"), uBeat = gl.getUniformLocation(prog, "uBeat");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    const t0 = performance.now();
    const draw = (now) => {
      size();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform1f(uBeat, (now - beatAt.current) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches || new URLSearchParams(window.location.search).has("static");
    if (still) { beatAt.current = performance.now() - 10000; draw(performance.now()); return; }

    let raf = 0, visible = false;
    const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
