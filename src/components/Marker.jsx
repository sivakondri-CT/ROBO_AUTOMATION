import React, { useRef } from "react";

/**
 * Marker: pointer events based draggable marker.
 * Props:
 *  - id, x, y (pixels relative to container)
 *  - containerRef (unused directly but kept for future)
 *  - onMove(id, clientX, clientY)
 */
export default function Marker({ id, x = 0, y = 0, highlighted=false, onMove }) {
  const elRef = useRef(null);
  const draggingRef = useRef(false);

  const onPointerDown = (e) => {
    e.preventDefault();
    draggingRef.current = true;
    const el = elRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    el.classList.add("dragging");
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;
    onMove(id, e.clientX, e.clientY);
  };

  const onPointerUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const el = elRef.current;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {}
    el && el.classList.remove("dragging");
    onMove(id, e.clientX, e.clientY);
  };

  return (
    <div
      ref={elRef}
      className={`marker ${highlighted ? "marker-highlight" : ""}`}
      style={{ left: `${Math.round(x)}px`, top: `${Math.round(y)}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <span className="marker-label">{id}</span>
    </div>
  );
}
