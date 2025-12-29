const BASE = "http://localhost:8000";

export const robotAPI = {
  pose: () => fetch(`${BASE}/robot/pose`).then(r => r.json()),

  goTo: (x, y) =>
    fetch(`${BASE}/robot/nav/coordinate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x, y, theta: 0 })
    }),
 
  goToName: (point) =>
    fetch(`${BASE}/robot/nav/name`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ point })
    }),

  cancel: () => fetch(`${BASE}/robot/nav/cancel`, { method: "POST" }),

  manual: (vx, vth) =>
    fetch(`${BASE}/robot/speed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vx, vth })
    })
};
