import React, { useRef, useEffect, useState } from "react";
import Marker from "./Marker";

export default function FloorMapCanvas({
  mapURL,
  data,
  selectedHouse,
  selectedFloor,
  onAddCoordinate,
  onMoveCoordinate,
  onOpenAddCoordinate,         
  onPrepareCoordinatePosition, 
}) {
  const containerRef = useRef(null);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      setRect(containerRef.current.getBoundingClientRect());
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [mapURL]);

  const coordinates =
    (selectedHouse && selectedFloor && data.houses?.[selectedHouse]?.floors?.[selectedFloor]?.coordinates) || {};

  const toCanvas = (clientX, clientY) => {
    if (!rect) return { x: clientX, y: clientY };
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x: Math.max(0, Math.min(x, rect.width)), y: Math.max(0, Math.min(y, rect.height)) };
  };

  const handleRightClick = (e) => {
    e.preventDefault();

    if (!selectedHouse || !selectedFloor) {
      alert("Select a House & Floor first.");
      return;
    }
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onPrepareCoordinatePosition({
      x: Math.round(x),
      y: Math.round(y),
    });

    onOpenAddCoordinate();
  };

  useEffect(() => {
    if (!rect) return;
    Object.entries(coordinates).forEach(([id, pos]) => {
      if (pos.x <= 1 && pos.y <= 1) {
        onMoveCoordinate(id, Math.round(rect.width / 2 - 18), Math.round(rect.height / 2 - 18));
      }
    });
  }, [rect]);

  return (
    <div className="canvas-wrapper">
      <div
        ref={containerRef}
        className="canvas"
        onContextMenu={handleRightClick} 
      >
        {mapURL ? (
          <img
            src={mapURL}
            alt="Floor map"
            className="floor-map"
            onLoad={() => {
              if (containerRef.current) setRect(containerRef.current.getBoundingClientRect());
            }}
          />
        ) : (
          <div className="empty-canvas">No floor map</div>
        )}

        {Object.entries(coordinates).map(([id, pos]) => (
          <Marker
            key={id}
            id={id}
            x={pos.x}
            y={pos.y}
            containerRef={containerRef}
            onMove={(markerId, clientX, clientY) => {
              const p = toCanvas(clientX, clientY);
              onMoveCoordinate(markerId, Math.round(p.x - 18), Math.round(p.y - 18));
            }}
          />
        ))}
      </div>
    </div>
  );
}
