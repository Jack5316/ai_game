import { useCallback, useEffect, useRef, useState } from "react";

type Props = { onDone: () => void };

export default function EnchantingIntro({ onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  /** Ref-only: updating mouse must not restart the canvas effect (resize clears buffer → white flash). */
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const [mounted, setMounted] = useState(false);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const onPointer = useCallback((e: React.PointerEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    mouseRef.current = {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.floor(clientWidth * dpr);
      canvas.height = Math.floor(clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (now: number) => {
      const { x: mx, y: my } = mouseRef.current;
      const t = (now - t0) / 1000;
      const blend = reduceMotion ? 0.32 : 0.28 + 0.14 * Math.sin(t * 0.22);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w * 0.5 + (mx - 0.5) * 64;
      const cy = h * 0.48 + (my - 0.5) * 48;

      ctx.fillStyle = "#07090e";
      ctx.fillRect(0, 0, w, h);

      const vignette = ctx.createRadialGradient(cx, cy, 40, cx, cy, Math.max(w, h) * 0.85);
      vignette.addColorStop(0, "rgba(18, 32, 42, 0.15)");
      vignette.addColorStop(0.45, "rgba(7, 9, 14, 0)");
      vignette.addColorStop(1, "rgba(2, 3, 6, 0.92)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      const mathWeight = 1 - blend;
      const compWeight = blend;

      if (compWeight > 0.05) {
        ctx.save();
        ctx.strokeStyle = `rgba(212, 168, 75, ${0.08 + compWeight * 0.22})`;
        ctx.lineWidth = 1;
        const step = 48;
        const skew = (mx - 0.5) * 24 * compWeight;
        for (let x = -step; x < w + step; x += step) {
          ctx.beginPath();
          ctx.moveTo(x + skew, 0);
          ctx.lineTo(x - skew * 0.4, h);
          ctx.stroke();
        }
        for (let y = -step; y < h + step; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y - skew);
          ctx.lineTo(w, y + skew * 0.3);
          ctx.stroke();
        }
        ctx.restore();
      }

      if (mathWeight > 0.05) {
        const curves = 5;
        for (let k = 0; k < curves; k++) {
          const phase = t * (0.35 + k * 0.07) + k * 1.7;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(122, 196, 214, ${0.12 + mathWeight * 0.35})`;
          ctx.lineWidth = 1.2 + k * 0.15;
          for (let i = 0; i <= 360; i++) {
            const u = (i / 360) * Math.PI * 2;
            const r =
              120 +
              k * 38 +
              Math.sin(u * 3 + phase) * 22 * mathWeight +
              Math.cos(u * 5 - phase * 0.5) * 14 * mathWeight;
            const px = cx + Math.cos(u + phase * 0.2) * r * (0.9 + my * 0.2);
            const py = cy + Math.sin(u * 1.2 + phase) * r * 0.55;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }

        ctx.strokeStyle = `rgba(232, 196, 140, ${0.2 + mathWeight * 0.45})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= 520; i++) {
          const u = (i / 520) * Math.PI * 2 * 2.2;
          const px = cx + Math.cos(u * 1.1 + t * 0.4) * (160 + Math.sin(u + t) * 40 * mathWeight);
          const py =
            cy +
            Math.sin(u * 0.9 - t * 0.25) * (90 + Math.cos(u * 2 + t * 0.6) * 35 * mathWeight);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      if (compWeight > 0.08) {
        const barY = h * 0.72;
        const barW = Math.min(420, w * 0.55);
        const barX = (w - barW) / 2;
        ctx.fillStyle = `rgba(20, 24, 32, ${0.35 + compWeight * 0.45})`;
        ctx.strokeStyle = `rgba(212, 168, 75, ${0.25 + compWeight * 0.35})`;
        ctx.lineWidth = 1;
        ctx.fillRect(barX, barY, barW, 10);
        ctx.strokeRect(barX + 0.5, barY + 0.5, barW - 1, 9);
        const playhead = barX + 12 + (barW - 24) * blend;
        ctx.fillStyle = `rgba(244, 210, 140, ${0.85})`;
        ctx.shadowColor = "rgba(244, 210, 140, 0.5)";
        ctx.shadowBlur = 18 * compWeight;
        ctx.beginPath();
        ctx.arc(playhead, barY + 5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    if (!reduceMotion) raf = requestAnimationFrame(draw);
    else draw(performance.now());

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [reduceMotion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDone]);

  return (
    <div
      ref={wrapRef}
      onPointerMove={onPointer}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        backgroundColor: "#07090e",
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        color: "#e8edf5",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          backgroundColor: "#07090e",
        }}
        aria-hidden
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(165deg, rgba(12,40,48,0.2) 0%, transparent 45%, rgba(8,10,18,0.82) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 480,
          margin: "0 auto",
          padding: "clamp(36px, 10vh, 72px) 24px 24px",
          pointerEvents: "none",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 500,
            fontSize: "clamp(2rem, 8vw, 2.75rem)",
            lineHeight: 1.15,
            margin: 0,
            color: "#f2f6fb",
          }}
        >
          思维炼金术
        </h1>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(200, 212, 228, 0.65)",
          }}
        >
          收集词语，推演真相。
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "clamp(32px, 8vh, 56px)",
          transform: "translateX(-50%)",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          width: "min(360px, 90vw)",
        }}
      >
        <button
          type="button"
          onClick={onDone}
          style={{
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.03em",
            padding: "12px 32px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            color: "#0a0c10",
            background: "linear-gradient(135deg, #e8c87a 0%, #c9a04a 55%, #a67c2f 100%)",
            boxShadow: "0 8px 28px rgba(212, 168, 75, 0.22)",
          }}
        >
          开始
        </button>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem("ma_intro_skip", "1");
            onDone();
          }}
          style={{
            fontFamily: "inherit",
            fontSize: 12,
            background: "none",
            border: "none",
            color: "rgba(160, 176, 190, 0.5)",
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          本次会话不再显示
        </button>
        <span style={{ fontSize: 11, color: "rgba(140, 155, 170, 0.4)" }}>Esc 跳过</span>
      </div>
    </div>
  );
}
