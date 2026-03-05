'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface PDFViewerProps {
  title: string;
  blobUrl?: string;
  pageCount?: number;
  onComplete?: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  title,
  blobUrl,
  pageCount = 0,
  onComplete,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!blobUrl) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 font-medium mb-2">PDF not available</p>
        <p className="text-sm text-gray-500 mb-4">Download the course to view offline</p>
        <Button variant="outline">Download Course</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">
            Page {currentPage} of {pageCount}
          </p>
        </div>
        <a
          href={blobUrl}
          download={`${title}.pdf`}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Download</span>
        </a>
      </div>

      {/* PDF Viewer */}
      <div className="bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
        <iframe
          src={`${blobUrl}#page=${currentPage}`}
          className="w-full h-96"
          title={title}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-sm text-gray-600">
          {currentPage} / {pageCount}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(Math.min(pageCount, currentPage + 1))}
          disabled={currentPage === pageCount}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        <Button
          className="ml-4"
          onClick={onComplete}
        >
          Mark as Complete
        </Button>
      </div>
    </div>
  );
};
