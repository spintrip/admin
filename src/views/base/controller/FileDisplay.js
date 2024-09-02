import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import { Document, Page, pdfjs } from 'react-pdf';

// Set the workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const getUpdatedFileUrl = (url) => {
    return `${url}?t=${new Date().getTime()}`;
  };

const FileDisplay = ({ fileUrl }) => {
  const [error, setError] = useState(null);

  const isImage = (url) => /\.(jpeg|jpg|png|webp)$/i.test(url);
  const isPdf = (url) => /\.pdf$/i.test(url);

  const handleDownload = (url) => {
    saveAs(url, 'downloaded-file');
  };

  const onLoadError = (error) => {
    setError(error.message);
  };

  if (isPdf(fileUrl)) {
    const updatedPdfUrl = getUpdatedFileUrl(fileUrl);
    return (
      <div>
        {error && <p>Error loading PDF: {error}</p>}
        <button onClick={() => handleDownload(updatedPdfUrl)}>View PDF</button>
      </div>
    );
  }

  if (isImage(fileUrl)) {
    return (
      <img
        src={fileUrl}
        alt="Uploaded file"
        className="img-thumbnail"
        onClick={() => handleDownload(fileUrl)}
      />
    );
  }

  return null;
};
export default FileDisplay;