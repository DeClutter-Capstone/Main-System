import React, { useEffect, useRef, useState } from "react";

interface BeforeAfterViewerProps {
  beforeSrc: string;
  afterSrc: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

type Mode = "slider" | "side";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const WHEEL_STEP = 1.2;

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * Modal that compares a before/after image pair.
 *
 * Modes: the two images side by side (default), or a draggable wipe slider.
 * Both modes support zooming (mouse wheel or the +/− buttons) and panning by
 * dragging while zoomed in; the zoom state is shared so the images stay in
 * sync across modes.
 */
function BeforeAfterViewer({
  beforeSrc,
  afterSrc,
  title,
  subtitle,
  onClose,
}: BeforeAfterViewerProps) {
  const [mode, setMode] = useState<Mode>("side");
  // Slider handle position, percent from the left edge.
  const [pos, setPos] = useState(50);
  const [scale, setScale] = useState(1);
  // Pan offset in container px, with transform-origin at the top-left corner.
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // Disables the clip-path/handle transitions so dragging feels 1:1, and
  // fades the Before/After badges out of the way.
  const [isDragging, setIsDragging] = useState(false);

  const sliderBoxRef = useRef<HTMLDivElement>(null);
  const sideBoxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<
    null | { kind: "slider" } | { kind: "pan"; lastX: number; lastY: number }
  >(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Keep the (scaled) image covering the container on both axes.
  const clampOffset = (
    o: { x: number; y: number },
    s: number,
    rect: { width: number; height: number },
  ) => ({
    x: clamp(o.x, rect.width * (1 - s), 0),
    y: clamp(o.y, rect.height * (1 - s), 0),
  });

  const applyZoomRef = useRef<
    (cx: number, cy: number, factor: number, rect: DOMRect) => void
  >(() => {});
  applyZoomRef.current = (cx, cy, factor, rect) => {
    const next = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
    if (next === scale) return;
    if (next === 1) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      return;
    }
    // Keep the point under the cursor stationary while scaling.
    const ratio = next / scale;
    setScale(next);
    setOffset(
      clampOffset(
        { x: cx - (cx - offset.x) * ratio, y: cy - (cy - offset.y) * ratio },
        next,
        rect,
      ),
    );
  };

  // Wheel-to-zoom needs a non-passive native listener; React's onWheel can't
  // call preventDefault reliably.
  useEffect(() => {
    const el = mode === "slider" ? sliderBoxRef.current : sideBoxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // In side-by-side mode zoom relative to the hovered half so the cursor
      // point stays fixed within that image.
      const target =
        mode === "side"
          ? ((e.target as HTMLElement).closest(".bav-zoomable") as HTMLElement | null)
          : el;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      applyZoomRef.current(
        e.clientX - rect.left,
        e.clientY - rect.top,
        e.deltaY < 0 ? WHEEL_STEP : 1 / WHEEL_STEP,
        rect,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [mode]);

  const zoomBy = (factor: number) => {
    const el =
      mode === "slider"
        ? sliderBoxRef.current
        : (sideBoxRef.current?.querySelector(".bav-zoomable") as HTMLElement | null);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    applyZoomRef.current(rect.width / 2, rect.height / 2, factor, rect);
  };

  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // ── Slider-mode pointer handling ──
  const posFromPointer = (clientX: number) => {
    const rect = sliderBoxRef.current!.getBoundingClientRect();
    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
  };

  const onSliderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const onHandle = (e.target as HTMLElement).closest(".bav-handle");
    if (!onHandle && scale > 1) {
      dragRef.current = { kind: "pan", lastX: e.clientX, lastY: e.clientY };
    } else {
      dragRef.current = { kind: "slider" };
      setPos(posFromPointer(e.clientX));
    }
    setIsDragging(true);
  };

  const onSliderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === "slider") {
      setPos(posFromPointer(e.clientX));
    } else {
      const rect = sliderBoxRef.current!.getBoundingClientRect();
      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      setOffset((prev) =>
        clampOffset({ x: prev.x + dx, y: prev.y + dy }, scale, rect),
      );
    }
  };

  // ── Side-by-side pointer handling (pan only) ──
  const onSidePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { kind: "pan", lastX: e.clientX, lastY: e.clientY };
    setIsDragging(true);
  };

  const onSidePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.kind !== "pan") return;
    const zoomable = e.currentTarget.querySelector(".bav-zoomable");
    if (!zoomable) return;
    const rect = zoomable.getBoundingClientRect();
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    setOffset((prev) =>
      clampOffset(
        { x: prev.x + dx, y: prev.y + dy },
        scale,
        // Use the un-scaled box size for clamping.
        { width: rect.width / scale, height: rect.height / scale },
      ),
    );
  };

  const endDrag = () => {
    dragRef.current = null;
    setIsDragging(false);
  };

  const onSliderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") setPos((p) => clamp(p - 5, 0, 100));
    if (e.key === "ArrowRight") setPos((p) => clamp(p + 5, 0, 100));
  };

  const imgTransform: React.CSSProperties = {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
    transformOrigin: "0 0",
  };

  const dimBrokenImage = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.opacity = "0.35";
  };

  return (
    <div
      className="bav-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Before and after viewer"
    >
      <style>{viewerStyles}</style>
      <div className="bav-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bav-header">
          <div className="bav-header__text">
            <h2 className="bav-title">{title}</h2>
            {subtitle && <span className="bav-subtitle">{subtitle}</span>}
          </div>
          <button
            type="button"
            className="bav-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="bav-toolbar">
          <div
            className={`bav-modes bav-modes--${mode}`}
            role="tablist"
            aria-label="Comparison mode"
          >
            <span className="bav-modes__thumb" aria-hidden="true" />
            <button
              role="tab"
              aria-selected={mode === "side"}
              className={`bav-mode-btn${mode === "side" ? " bav-mode-btn--active" : ""}`}
              onClick={() => setMode("side")}
            >
              Side by side
            </button>
            <button
              role="tab"
              aria-selected={mode === "slider"}
              className={`bav-mode-btn${mode === "slider" ? " bav-mode-btn--active" : ""}`}
              onClick={() => setMode("slider")}
            >
              Slider
            </button>
          </div>
          <div className="bav-zoom">
            <button
              type="button"
              className="bav-zoom-btn"
              onClick={() => zoomBy(1 / WHEEL_STEP)}
              disabled={scale <= MIN_SCALE}
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="bav-zoom-level">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              className="bav-zoom-btn"
              onClick={() => zoomBy(WHEEL_STEP)}
              disabled={scale >= MAX_SCALE}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="bav-zoom-btn bav-zoom-btn--reset"
              onClick={resetZoom}
              disabled={scale === 1}
            >
              Reset
            </button>
          </div>
        </div>

        {mode === "slider" ? (
          <div
            key="slider"
            ref={sliderBoxRef}
            className={`bav-stage bav-slider-box${isDragging ? " bav-slider-box--dragging" : ""}`}
            onPointerDown={onSliderPointerDown}
            onPointerMove={onSliderPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={resetZoom}
            onKeyDown={onSliderKeyDown}
            role="slider"
            aria-label="Before and after comparison slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            tabIndex={0}
          >
            <div className="bav-layer">
              <img
                src={afterSrc}
                alt={`After — ${title}`}
                style={imgTransform}
                draggable={false}
              />
            </div>
            <div
              className="bav-layer bav-layer--clip"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            >
              <img
                src={beforeSrc}
                alt={`Before — ${title}`}
                style={imgTransform}
                draggable={false}
                onError={dimBrokenImage}
              />
            </div>
            <span className="bav-badge bav-badge--left">Before</span>
            <span className="bav-badge bav-badge--right">After</span>
            <div className="bav-handle" style={{ left: `${pos}%` }}>
              <div className="bav-handle__line" />
              <div className="bav-handle__grip" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 3 12 9 6" />
                  <polyline points="15 6 21 12 15 18" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div
            key="side"
            ref={sideBoxRef}
            className="bav-stage bav-side-box"
            onPointerDown={onSidePointerDown}
            onPointerMove={onSidePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={resetZoom}
            style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
          >
            <figure className="bav-figure">
              <div className="bav-zoomable">
                <img
                  src={beforeSrc}
                  alt={`Before — ${title}`}
                  style={imgTransform}
                  draggable={false}
                  onError={dimBrokenImage}
                />
                <span className="bav-shine" aria-hidden="true" />
              </div>
              <figcaption>Before</figcaption>
            </figure>
            <figure className="bav-figure">
              <div className="bav-zoomable">
                <img
                  src={afterSrc}
                  alt={`After — ${title}`}
                  style={imgTransform}
                  draggable={false}
                />
                <span className="bav-shine" aria-hidden="true" />
              </div>
              <figcaption>After</figcaption>
            </figure>
          </div>
        )}

        <p className="bav-hint">
          {mode === "slider"
            ? "Drag the handle to compare · scroll to zoom · drag to pan when zoomed"
            : "Scroll to zoom · drag to pan when zoomed"}
        </p>
      </div>
    </div>
  );
}

const viewerStyles = `
  @keyframes bav-overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes bav-modal-in {
    from { opacity: 0; transform: translateY(14px) scale(0.965); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes bav-stage-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes bav-grip-pulse {
    0%, 100% { box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35), 0 0 0 0 rgba(255, 255, 255, 0.45); }
    50%      { box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35), 0 0 0 8px rgba(255, 255, 255, 0); }
  }

  .bav-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.62);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 24px;
    backdrop-filter: blur(6px) saturate(1.1);
    animation: bav-overlay-in 0.22s ease both;
  }
  .bav-modal {
    background-color: var(--color-bg-surface, #ffffff);
    border: 1px solid var(--color-border-subtle, #e0e0e0);
    border-radius: 16px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
    width: 100%;
    max-width: 920px;
    max-height: 92vh;
    overflow-y: auto;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: bav-modal-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .bav-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  .bav-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 4px;
    color: var(--color-text-primary, #1a1a1a);
    word-break: break-word;
  }
  .bav-subtitle {
    font-size: 13px;
    color: var(--color-text-secondary, #888888);
  }
  .bav-close {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--color-border-subtle, #e0e0e0);
    background-color: transparent;
    color: var(--color-text-primary, #1a1a1a);
    font-size: 15px;
    cursor: pointer;
    line-height: 1;
    transition: background-color 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  }
  .bav-close:hover {
    background-color: var(--color-bg-elevated, #f5f5f5);
    transform: rotate(90deg) scale(1.06);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }
  .bav-close:active {
    transform: rotate(90deg) scale(0.94);
  }

  .bav-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  /* Mode switcher: equal-width pill with a thumb that glides between tabs. */
  .bav-modes {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 3px;
    background-color: var(--color-bg-elevated, #f0f0f0);
    border-radius: 10px;
    isolation: isolate;
  }
  .bav-modes__thumb {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc(50% - 3px);
    border-radius: 8px;
    background-color: var(--color-bg-surface, #ffffff);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.14);
    transition: transform 0.28s cubic-bezier(0.34, 1.4, 0.64, 1);
    z-index: -1;
  }
  .bav-modes--slider .bav-modes__thumb {
    transform: translateX(100%);
  }
  .bav-mode-btn {
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--color-text-secondary, #666666);
    cursor: pointer;
    transition: color 0.2s ease;
    white-space: nowrap;
  }
  .bav-mode-btn:hover:not(.bav-mode-btn--active) {
    color: var(--color-text-primary, #1a1a1a);
  }
  .bav-mode-btn--active {
    color: var(--color-text-primary, #1a1a1a);
  }

  .bav-zoom {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .bav-zoom-btn {
    min-width: 30px;
    height: 30px;
    padding: 0 8px;
    border-radius: 7px;
    border: 1px solid var(--color-border-subtle, #e0e0e0);
    background-color: transparent;
    color: var(--color-text-primary, #1a1a1a);
    font-size: 15px;
    font-family: inherit;
    cursor: pointer;
    line-height: 1;
    transition: background-color 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
  }
  .bav-zoom-btn--reset {
    font-size: 12px;
  }
  .bav-zoom-btn:hover:not(:disabled) {
    background-color: var(--color-bg-elevated, #f5f5f5);
    transform: translateY(-1px);
  }
  .bav-zoom-btn:active:not(:disabled) {
    transform: translateY(0) scale(0.95);
  }
  .bav-zoom-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .bav-zoom-level {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--color-text-secondary, #666666);
    min-width: 38px;
    text-align: center;
  }

  /* Both stages fade in when mounted / when the mode switches. */
  .bav-stage {
    animation: bav-stage-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  /* ── Slider mode ── */
  .bav-slider-box {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--color-bg-elevated, #f0f0f0);
    touch-action: none;
    user-select: none;
    cursor: ew-resize;
    outline: none;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
  }
  .bav-slider-box:focus-visible {
    box-shadow: 0 0 0 3px var(--color-focus-ring, rgba(37, 99, 235, 0.35));
  }
  .bav-layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  /* Glide when the user clicks to jump; 1:1 while dragging. */
  .bav-layer--clip {
    transition: clip-path 0.24s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .bav-slider-box--dragging .bav-layer--clip {
    transition: none;
  }
  .bav-layer img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
  }
  .bav-badge {
    position: absolute;
    top: 12px;
    padding: 4px 11px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #ffffff;
    background-color: rgba(0, 0, 0, 0.55);
    border-radius: 999px;
    pointer-events: none;
    backdrop-filter: blur(4px);
    transition: opacity 0.25s ease, transform 0.25s ease;
  }
  .bav-badge--left { left: 12px; }
  .bav-badge--right { right: 12px; }
  /* Get the labels out of the way mid-drag. */
  .bav-slider-box--dragging .bav-badge {
    opacity: 0.35;
    transform: translateY(-2px) scale(0.94);
  }
  .bav-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    cursor: ew-resize;
    transition: left 0.24s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .bav-slider-box--dragging .bav-handle {
    transition: none;
  }
  .bav-handle__line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: -1.5px;
    width: 3px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.65),
      #ffffff 18%,
      #ffffff 82%,
      rgba(255, 255, 255, 0.65)
    );
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.45);
    transition: box-shadow 0.2s ease;
  }
  .bav-slider-box:hover .bav-handle__line {
    box-shadow: 0 0 14px rgba(255, 255, 255, 0.55), 0 0 8px rgba(0, 0, 0, 0.45);
  }
  .bav-handle__grip {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(-50%, -50%);
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background-color: #ffffff;
    color: #333333;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    animation: bav-grip-pulse 2.4s ease-in-out 0.6s 2;
  }
  .bav-slider-box:hover .bav-handle__grip {
    transform: translate(-50%, -50%) scale(1.12);
  }
  .bav-slider-box--dragging .bav-handle__grip {
    transform: translate(-50%, -50%) scale(1.18);
    animation: none;
  }
  .bav-handle__grip svg {
    width: 18px;
    height: 18px;
  }

  /* ── Side-by-side mode ── */
  .bav-side-box {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    touch-action: none;
    user-select: none;
  }
  @media (max-width: 560px) {
    .bav-side-box { grid-template-columns: 1fr; }
  }
  .bav-figure {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 9px;
    min-width: 0;
  }
  .bav-zoomable {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: 12px;
    overflow: hidden;
    background-color: var(--color-bg-elevated, #f0f0f0);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease;
  }
  .bav-zoomable img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    pointer-events: none;
    transition: filter 0.28s ease;
  }
  /* Hovering one image lifts it with a brand-colored glow while the sibling
     gently recedes — focuses the eye without hiding anything. */
  .bav-figure:hover .bav-zoomable {
    transform: translateY(-4px);
    box-shadow:
      0 12px 28px rgba(0, 0, 0, 0.22),
      0 0 0 2px var(--color-brand-primary, #2563eb);
  }
  .bav-side-box:hover .bav-figure:not(:hover) .bav-zoomable img {
    filter: brightness(0.82) saturate(0.92);
  }
  /* A soft sheen sweeps across the hovered image, once. */
  .bav-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 38%,
      rgba(255, 255, 255, 0.22) 50%,
      transparent 62%
    );
    transform: translateX(-110%);
    pointer-events: none;
  }
  .bav-figure:hover .bav-shine {
    transition: transform 0.65s cubic-bezier(0.25, 1, 0.5, 1);
    transform: translateX(110%);
  }
  .bav-figure figcaption {
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--color-text-secondary, #666666);
    transition: color 0.25s ease, letter-spacing 0.25s ease;
  }
  .bav-figure:hover figcaption {
    color: var(--color-brand-primary, #2563eb);
    letter-spacing: 2px;
  }

  .bav-hint {
    margin: 0;
    font-size: 12px;
    text-align: center;
    color: var(--color-text-tertiary, #999999);
    opacity: 0.85;
  }
`;

export default BeforeAfterViewer;
