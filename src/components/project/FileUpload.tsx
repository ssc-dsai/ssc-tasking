import React, { useCallback, useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use local file for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface ProcessedFile {
  file: File;
  extractedText?: string;
}

interface FileUploadProps {
  onFileUpload: (files: ProcessedFile[]) => void;
  isUploading?: boolean;
  uploadProgress?: number | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  isUploading: externalIsUploading = false,
  uploadProgress: externalUploadProgress = null
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  // Use external upload progress if available, otherwise use internal
  const currentUploadProgress = externalUploadProgress !== null ? externalUploadProgress : uploadProgress;
  const currentIsUploading = externalIsUploading || uploadProgress !== null;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
      // Reset the input so the same file can be selected again if needed
      e.target.value = '';
    }
  }, []);

  const handleAreaClick = () => {
    if (!currentIsUploading && inputRef.current) {
      inputRef.current.click();
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log('📄 [Client PDF] Extracting text from:', file.name);
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Try to load the PDF with different worker configurations if needed
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          verbosity: 0 // Suppress console output
        }).promise;
      } catch (workerError) {
        console.log('⚠️ [Client PDF] Worker failed, trying without worker...');
        // Fallback: disable worker for this operation
        const originalWorkerSrc = pdfjsLib.GlobalWorkerOptions.workerSrc;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '';
        
        try {
          pdf = await pdfjsLib.getDocument({ 
            data: arrayBuffer,
            verbosity: 0
          }).promise;
        } finally {
          // Restore original worker configuration
          pdfjsLib.GlobalWorkerOptions.workerSrc = originalWorkerSrc;
        }
      }
      
      console.log(`📄 [Client PDF] Loaded PDF with ${pdf.numPages} pages`);
      
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n\n';
          }
          
          console.log(`📄 [Client PDF] Page ${pageNum}: ${pageText.length} characters`);
        } catch (pageError) {
          console.error(`❌ [Client PDF] Error on page ${pageNum}:`, pageError);
          // Continue with other pages
        }
      }
      
      const cleanedText = fullText.trim();
      console.log(`📄 [Client PDF] Total extracted: ${cleanedText.length} characters`);
      
      if (cleanedText.length > 0) {
        console.log(`📄 [Client PDF] Sample: "${cleanedText.substring(0, 200)}..."`);
        return cleanedText;
      } else {
        throw new Error('No text content found in PDF');
      }
    } catch (error) {
      console.error('❌ [Client PDF] Extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await file.text();
    } else if (fileName.endsWith('.rtf')) {
      // Basic RTF text extraction (remove RTF formatting)
      const rtfContent = await file.text();
      return rtfContent.replace(/\\[a-z]+\d*\s?/g, '').replace(/[{}]/g, '').trim();
    }
    
    throw new Error(`Unsupported file type: ${fileType}`);
  };

  const processFiles = async (files: File[]) => {
    try {
      console.log('🔄 [File Processing] Processing', files.length, 'files');
      
      const processedFiles: ProcessedFile[] = [];
      
      for (const file of files) {
        try {
          console.log('🔄 [File Processing] Processing:', file.name);
          
          const extractedText = await extractTextFromFile(file);
          
          processedFiles.push({
            file,
            extractedText
          });
          
          console.log('✅ [File Processing] Successfully processed:', file.name);
        } catch (error) {
          console.error('❌ [File Processing] Failed to process:', file.name, error);
          
          // Add file without extracted text (will be handled by server)
          processedFiles.push({
            file
          });
        }
      }
      
      if (externalIsUploading) {
        // Real upload - call the handler with processed files
        onFileUpload(processedFiles);
      } else {
        // Mock upload - simulate progress
        setUploadProgress(0);
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setUploadProgress(i);
        }
        setUploadProgress(null);
        onFileUpload(processedFiles);
      }
    } catch (error) {
      console.error('❌ [File Processing] Processing failed:', error);
      setUploadProgress(null);
    }
  };

  return (
    <div className="mb-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleAreaClick}
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          accept=".pdf,.txt,.rtf"
          ref={inputRef}
        />
        
        {currentUploadProgress !== null ? (
          <div className="space-y-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Upload className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {externalIsUploading ? 'Uploading to server...' : 'Uploading files...'}
              </p>
              <div className="w-48 mx-auto bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentUploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{Math.round(currentUploadProgress)}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drag & drop files here, or{' '}
                <label htmlFor="file-upload" className="text-primary cursor-pointer hover:text-primary/80">
                  browse
                </label>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports PDF, TXT, and RTF files only (max 10MB each)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
