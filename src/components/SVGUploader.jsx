import { useState } from "react";

function SVGUploader() {
  const [svgContent, setSvgContent] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/svg+xml") {
      const text = await file.text();
      setSvgContent(text);
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept=".svg"
        onChange={handleFileUpload}
        className="mb-4"
      />
      {svgContent && (
        <div
          className="bg-white border rounded p-4 shadow"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
}

export default SVGUploader;
