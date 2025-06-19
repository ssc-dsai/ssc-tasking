import React, { useCallback, useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use local file for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Add logging to verify worker configuration
console.log('📄 [PDF.js Config] Worker source set to:', pdfjsLib.GlobalWorkerOptions.workerSrc);
console.log('📄 [PDF.js Config] FileUpload component loaded at:', new Date().toISOString());

interface ProcessedFile {
  file: File;
  extractedText?: string;
}

interface FileUploadProps {
  onFileUpload: (files: ProcessedFile[]) => void;
  isUploading?: boolean;
  uploadProgress?: number | null;
  hasFiles?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileUpload, 
  isUploading: externalIsUploading = false,
  uploadProgress: externalUploadProgress = null,
  hasFiles = false
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
      console.log('📄 [Client PDF] Starting extraction for:', file.name);
      console.log('📄 [Client PDF] PDF.js version:', pdfjsLib.version || 'unknown');
      console.log('📄 [Client PDF] Worker source:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      
      const arrayBuffer = await file.arrayBuffer();
      console.log('📄 [Client PDF] File loaded as ArrayBuffer, size:', arrayBuffer.byteLength);
      
      // Try to load the PDF with more robust error handling
      let pdf;
      try {
        console.log('📄 [Client PDF] Attempting to load PDF document...');
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          verbosity: 0 // Suppress console output
        }).promise;
        console.log('📄 [Client PDF] PDF document loaded successfully');
      } catch (workerError) {
        console.warn('⚠️ [Client PDF] Primary load failed, trying fallback...', workerError.message);
        console.warn('⚠️ [Client PDF] Full error:', workerError);
        
        // Simple fallback - just retry once
        try {
          // Wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log('📄 [Client PDF] Retrying PDF load...');
          pdf = await pdfjsLib.getDocument({ 
            data: arrayBuffer,
            verbosity: 0
          }).promise;
          console.log('📄 [Client PDF] PDF document loaded on retry');
        } catch (fallbackError) {
          console.error('❌ [Client PDF] Both attempts failed:', fallbackError);
          throw new Error(`PDF loading failed: ${fallbackError.message}`);
        }
      }
      
      console.log(`📄 [Client PDF] Loaded PDF with ${pdf.numPages} pages`);
      
      let fullText = '';
      const maxPages = Math.min(pdf.numPages, 50); // Limit to first 50 pages for performance
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          
          // Try primary text extraction method
          let textContent;
          try {
            textContent = await page.getTextContent({
              normalizeWhitespace: true, // Normalize whitespace
              disableCombineTextItems: false // Allow combining text items for better reading
            });
          } catch (textError) {
            // Fallback to basic text extraction
            console.warn(`⚠️ [Client PDF] Primary text extraction failed on page ${pageNum}, trying fallback...`);
            textContent = await page.getTextContent();
          }
          
          // Better text extraction handling different PDF text formats
          const textItems: string[] = [];
          
          for (const item of textContent.items) {
            if (item && typeof item === 'object') {
              let text = '';
              
              // Handle different text item structures
              if ('str' in item && typeof item.str === 'string') {
                text = item.str;
              } else if ('chars' in item && typeof item.chars === 'string') {
                text = item.chars;
              } else if (typeof item === 'string') {
                text = item;
              }
              
              // Clean and validate the text
              if (text && text.trim().length > 0) {
                // Filter out obvious garbage/binary data
                const cleanText = text
                  .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
                  .replace(/[^\x20-\x7E\s\u00A0-\uFFFF]/g, '') // Keep printable ASCII and Unicode
                  .trim();
                
                // Only include text that seems readable (has letters/numbers)
                if (cleanText && /[a-zA-Z0-9]/.test(cleanText)) {
                  textItems.push(cleanText);
                }
              }
            }
          }
          
          if (textItems.length > 0) {
            // Join text items with appropriate spacing
            const pageText = textItems.join(' ')
              .replace(/\s+/g, ' ') // Normalize multiple spaces
              .trim();
            
            if (pageText.length > 0) {
              fullText += pageText + '\n\n';
            }
          }
          
          // Only log every 10 pages to reduce spam
          if (pageNum % 10 === 0 || pageNum === maxPages) {
            console.log(`📄 [Client PDF] Processed ${pageNum}/${maxPages} pages`);
          }
        } catch (pageError) {
          console.warn(`⚠️ [Client PDF] Error on page ${pageNum}:`, pageError.message);
          // Continue with other pages - don't let one bad page stop everything
        }
      }
      
      if (pdf.numPages > maxPages) {
        console.log(`📄 [Client PDF] Limited extraction to first ${maxPages} pages of ${pdf.numPages} total`);
      }
      
      const cleanedText = fullText.trim();
      console.log(`📄 [Client PDF] Total extracted: ${cleanedText.length} characters`);
      
      if (cleanedText.length > 0) {
        // Validate that the extracted text looks reasonable
        const readableChars = cleanedText.match(/[a-zA-Z0-9\s]/g);
        const readabilityRatio = readableChars ? readableChars.length / cleanedText.length : 0;
        
        // Add diagnostic information
        console.log(`📄 [Client PDF] Text analysis: ${readabilityRatio.toFixed(2)} readability ratio`);
        if (cleanedText.length > 50) {
          const firstChars = cleanedText.substring(0, 50);
          const charCodes = Array.from(firstChars).map(c => c.charCodeAt(0));
          console.log(`📄 [Client PDF] First 50 chars:`, firstChars);
          console.log(`📄 [Client PDF] Character codes:`, charCodes);
        }
        
        if (readabilityRatio < 0.5) {
          console.warn('⚠️ [Client PDF] Extracted text appears to be largely non-readable (possibly encoded/encrypted PDF)');
          
          // Try to provide more helpful error message
          if (readabilityRatio < 0.1) {
            throw new Error('PDF appears to contain mostly binary/encoded data. This may be a scanned PDF, encrypted, or use custom fonts.');
          } else {
            throw new Error('PDF contains mixed readable and encoded text. It may use special formatting or be partially encrypted.');
          }
        }
        
        // Only show sample if text is long enough and readable
        if (cleanedText.length > 200 && readabilityRatio > 0.7) {
          console.log(`📄 [Client PDF] Sample: "${cleanedText.substring(0, 200)}..."`);
        }
        return cleanedText;
      } else {
        throw new Error('No readable text content found in PDF - it may be image-based, encrypted, or use complex formatting');
      }
    } catch (error) {
      console.error('❌ [Client PDF] Extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    console.log('📄 [File Extraction] File type detection:', fileType, 'fileName:', fileName);
    
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      console.log('📄 [File Extraction] Detected PDF, using PDF extraction');
      return await extractTextFromPDF(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      console.log('📄 [File Extraction] Detected TXT, using text extraction');
      return await file.text();
    } else if (fileName.endsWith('.rtf')) {
      console.log('📄 [File Extraction] Detected RTF, using RTF extraction');
      // Basic RTF text extraction (remove RTF formatting)
      const rtfContent = await file.text();
      return rtfContent.replace(/\\[a-z]+\d*\s?/g, '').replace(/[{}]/g, '').trim();
    }
    
    console.error('📄 [File Extraction] Unsupported file type:', fileType, 'for file:', fileName);
    throw new Error(`Unsupported file type: ${fileType}`);
  };

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    try {
      console.log('🔄 [File Processing] Starting processing of', files.length, 'file(s):', files.map(f => f.name).join(', '));
      
      const processedFiles: ProcessedFile[] = [];
      
      for (const file of files) {
        console.log('🔄 [File Processing] Processing file:', file.name, `(${file.type}, ${file.size} bytes)`);
        
        try {
          const extractedText = await extractTextFromFile(file);
          
          processedFiles.push({
            file,
            extractedText
          });
          
          console.log('✅ [File Processing] Successfully processed:', file.name, `(${extractedText.length} chars)`);
        } catch (error) {
          console.error('❌ [File Processing] Text extraction failed for:', file.name);
          console.error('❌ [File Processing] Error details:', error instanceof Error ? error.message : 'Unknown error');
          console.error('❌ [File Processing] Full error:', error);
          
          // Add file without extracted text (will be handled by server)
          processedFiles.push({
            file
          });
          
          console.log('⚠️ [File Processing] Added file without extracted text, server will handle extraction');
        }
      }
      
      console.log(`✅ [File Processing] Completed processing ${processedFiles.length}/${files.length} files`);
      
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

  // If files exist, show compact upload button
  if (hasFiles) {
    return (
      <div className="mb-4">
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          id="file-upload-compact"
          accept=".pdf,.txt,.rtf"
          ref={inputRef}
        />
        
        <Button
          onClick={handleAreaClick}
          disabled={currentIsUploading}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 h-10"
        >
          {currentIsUploading ? (
            <>
              <Upload className="w-4 h-4 animate-pulse" />
              <span>Uploading... {Math.round(currentUploadProgress || 0)}%</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload More Files</span>
            </>
          )}
        </Button>
      </div>
    );
  }

  // If no files, show full dropzone
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
