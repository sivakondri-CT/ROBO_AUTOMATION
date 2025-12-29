const BASE = "http://localhost:8000";

export const layoutAPI = {
  get: () => fetch(`${BASE}/layout`).then(r => r.json()),

  save: (data) =>
    fetch(`${BASE}/layout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }),

  uploadMap: async (file) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${BASE}/layout/upload_map`, {
      method: "POST",
      body: form
    });

    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  }
};
