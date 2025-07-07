import React from 'react';

const PdfUploader = ({
  fileInputRef,
  selectedFile,
  title,
  setTitle,
  handleFileChange,
  handleUpload
}) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Enter PDF title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 border border-gray-300 rounded w-full mb-4"
      />

      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => fileInputRef.current.click()}
        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 mb-2"
      >
        Choose PDF File
      </button>

      {selectedFile && (
        <p className="text-sm text-gray-600 mb-4">
          Selected File: <strong>{selectedFile.name}</strong>
        </p>
      )}

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload PDF
      </button>
    </div>
  );
};

export default PdfUploader;
