import React, { useRef } from "react";

/**
 * UploadScreen - initial screen with Upload button and Use Sample Map
 */
export default function UploadScreen({ onUpload, samplePath }) {
  const ref = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) onUpload(f);
  };

  return (
    <div className="upload-screen">
      <div className="upload-card">
        <h1 className="brand">Upload Floor Map</h1>

        <div className="upload-actions">
          <label className="btn primary">
            Upload 
            <input ref={ref} className="hidden-input" type="file" accept="image/*" onChange={handleFile} />
          </label>

          <button
            className="btn secondary"
            onClick={() => {
              if (!samplePath) return alert("No sample available.");
              onUpload(samplePath);
            }}
          >
            Use Sample Map
          </button>
        </div>

        <small className="hint">Supported: PNG, JPG.</small>
      </div>
    </div>
  );
}
