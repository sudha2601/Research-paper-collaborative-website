import React from 'react';

const PdfList = ({ pdfs, onSelect, onDelete, selectedPdfId }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Uploaded PDFs</h3>
      <ul className="list-disc pl-5">
        {pdfs.map((pdf) => (
          <li key={pdf._id} className="flex justify-between items-center gap-2">
            <button
              className={`underline ${
                selectedPdfId === pdf._id ? 'text-blue-800 font-semibold' : 'text-blue-600 hover:text-blue-800'
              }`}
              onClick={() => onSelect(pdf)}
            >
              {pdf.title}
            </button>
            <button
              className="text-red-600 hover:text-red-800 text-sm"
              onClick={() => onDelete(pdf._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PdfList;
