'use client';

import { useEffect, useState } from 'react';
import { useIPFS } from '@/hooks/useIPFS';
import { ScaleLoader } from 'react-spinners'; // Using react-spinners for loading animation

interface DocumentViewerProps {
  ipfsCid: string;
  fileName?: string; // Optional: for context or download attribute
  fileTypeHint?: string; // Optional: e.g., 'application/pdf', 'image/png' to help rendering
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ ipfsCid, fileName, fileTypeHint }) => {
  const ipfsService = useIPFS();
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const [detectedFileType, setDetectedFileType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ipfsCid || !ipfsService.isConfigured) {
      if (!ipfsService.isConfigured) {
        setError('IPFS service is not configured. Please check API key.');
      }
      return;
    }

    let currentObjectUrl: string | null = null;
    const fetchDocument = async () => {
      setIsLoading(true);
      setError(null);
      setDocumentUrl(null);
      setDocumentText(null);
      setDetectedFileType(fileTypeHint || null);

      try {
        const response = await ipfsService.getFileResponse(ipfsCid);
        const contentType = response.headers.get('Content-Type') || fileTypeHint;
        setDetectedFileType(contentType);

        if (contentType) {
          if (contentType.startsWith('image/')) {
            const blob = await response.blob();
            currentObjectUrl = URL.createObjectURL(blob);
            setDocumentUrl(currentObjectUrl);
          } else if (contentType === 'application/pdf') {
            const blob = await response.blob();
            currentObjectUrl = URL.createObjectURL(blob);
            setDocumentUrl(currentObjectUrl);
          } else if (contentType.startsWith('text/')) {
            const text = await response.text();
            setDocumentText(text);
          } else {
            // For other types, allow download
            const blob = await response.blob();
            currentObjectUrl = URL.createObjectURL(blob);
            setDocumentUrl(currentObjectUrl); // Set for download link
            // Consider setting an 'unsupported' or 'downloadable' type
            setDetectedFileType('application/octet-stream'); // Generic fallback for download
          }
        } else {
          // If no content type, try to infer or treat as downloadable blob
           const blob = await response.blob();
           currentObjectUrl = URL.createObjectURL(blob);
           setDocumentUrl(currentObjectUrl);
           setDetectedFileType('application/octet-stream'); 
           console.warn('Content-Type not available, providing as download.')
        }
      } catch (err: any) {
        console.error('Error fetching document from IPFS:', err);
        setError(`Failed to load document: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();

    return () => {
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [ipfsCid, ipfsService, fileTypeHint]);

  if (!ipfsService.isConfigured && !error) {
     return (
      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200 text-yellow-700">
        IPFS Service not configured. Document viewer is inactive.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 min-h-[200px] bg-gray-50 rounded-lg shadow">
        <ScaleLoader color="#3B82F6" loading={isLoading} height={35} width={4} radius={2} margin={2} />
        <p className="mt-3 text-sm text-gray-600">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 border-red-200 text-red-700">
        <p className="font-semibold">Error loading document:</p>
        <p>{error}</p>
        {ipfsCid && <p className="text-xs mt-1">CID: {ipfsCid}</p>}
      </div>
    );
  }

  if (documentUrl && detectedFileType) {
    if (detectedFileType.startsWith('image/')) {
      return (
        <div className="rounded-lg overflow-hidden shadow">
          <img src={documentUrl} alt={fileName || 'IPFS Document'} className="w-full h-auto object-contain max-h-[80vh]" />
          {fileName && <p className="text-xs text-gray-500 p-2 bg-gray-50">{fileName}</p>}
        </div>
      );
    } else if (detectedFileType === 'application/pdf') {
      return (
        <div className="w-full h-[70vh] min-h-[500px] rounded-lg shadow overflow-hidden">
          <iframe src={documentUrl} title={fileName || 'PDF Document'} width="100%" height="100%" frameBorder="0" />
          {fileName && <p className="text-xs text-gray-500 p-2 bg-gray-50">{fileName}</p>}
        </div>
      );
    } else if (detectedFileType === 'application/octet-stream' || !detectedFileType.startsWith('text/') ) { // Offer download for generic binary or unhandled
        return (
         <div className="p-4 border rounded-lg bg-blue-50 border-blue-200 text-center">
            <p className="text-blue-700 mb-2">
              {fileName ? `Preview for '${fileName}' is not available.` : 'Preview not available.'}
            </p>
            <a
              href={documentUrl}
              download={fileName || `ipfs_doc_${ipfsCid}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Download {fileName || 'Document'}
            </a>
        </div>
        )
    }
  }
  
  if (documentText && detectedFileType && detectedFileType.startsWith('text/')) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 shadow max-h-[70vh] overflow-auto">
        {fileName && <p className="text-sm font-semibold text-gray-700 mb-2">{fileName}</p>}
        <pre className="whitespace-pre-wrap break-all text-sm text-gray-800">
          {documentText}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-100 text-gray-600">
      No document to display or unsupported file type.
      {fileName && <p className="text-xs mt-1">File: {fileName}</p>}
      {ipfsCid && <p className="text-xs mt-1">CID: {ipfsCid}</p>}
    </div>
  );
};

export default DocumentViewer; 