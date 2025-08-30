import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUploadStore } from '../stores/useUploadStore';

export const UploadArea: React.FC = () => {
  const { file, isUploading, isProcessing, error, setFile, setError } = useUploadStore();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File size exceeds 10MB. Please compress your PDF or contact support.');
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Please upload a PDF file. Other formats are not currently supported.');
      } else {
        setError('Invalid file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      setError(null);
      setFile(acceptedFiles[0]);
    }
  }, [setFile, setError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    disabled: isUploading || isProcessing
  });

  const isDisabled = isUploading || isProcessing;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-300 cursor-pointer
          ${isDragActive 
            ? 'border-primary bg-primary/5 scale-105' 
            : isDisabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'
          }
          ${file && !isDisabled ? 'border-green-300 bg-green-50' : ''}
          ${!isDisabled ? 'hover:scale-102 active:scale-98' : ''}
        `}
        style={{ 
          transform: !isDisabled && isDragActive ? 'scale(1.02)' : undefined,
          transition: 'all 0.2s ease'
        }}
      >
        <input {...getInputProps()} />
        
        <div className="px-6 py-12 text-center">
          {file ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="relative">
                <FileText className={`mx-auto h-12 w-12 ${isDisabled ? 'text-primary' : 'text-green-500'}`} />
                {isDisabled && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </motion.div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900 break-words px-2">
                  {file.name}
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <span className="text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className={`font-medium ${
                    isUploading ? 'text-blue-600' :
                    isProcessing ? 'text-primary' :
                    'text-green-600'
                  }`}>
                    {isUploading ? 'Uploading...' :
                     isProcessing ? 'Processing...' :
                     'Ready to process'}
                  </span>
                </div>
                {isDisabled && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3"
                  >
                    <div className="bg-gray-100 rounded-full h-1.5 w-48 mx-auto overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  </motion.div>
                )}
              </div>
              {!isDisabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-sm text-gray-500 hover:text-red-500 underline transition-colors duration-200"
                >
                  Remove file
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <Upload className={`mx-auto h-12 w-12 transition-colors ${isDragActive ? 'text-primary' : 'text-gray-400'}`} />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your PDF here' : 'Drop your PDF here'}
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Max 10MB, PDF files only
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}
    </div>
  );
};