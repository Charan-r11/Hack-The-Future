import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Trash2, Upload, File, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileUpload: (files: File[]) => void;
  uploadedFiles: File[];
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileUpload, 
  uploadedFiles 
}) => {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    onFileUpload([...uploadedFiles, ...pdfFiles]);
    setDragOver(false);
  }, [onFileUpload, uploadedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false)
  });

  const removeFile = (fileToRemove: File) => {
    onFileUpload(uploadedFiles.filter(file => file !== fileToRemove));
  };

  return (
    <div className="space-y-5">
      <div 
        {...getRootProps()} 
        className={cn(
          'p-8 rounded-2xl text-center cursor-pointer transition-all duration-300',
          'backdrop-blur-sm border-2 border-dashed bg-black/20',
          'hover:border-[#00ffd5]/50 hover:shadow-[0_0_15px_rgba(0,255,213,0.2)]',
          isDragActive || dragOver
            ? 'border-[#00ffd5] bg-[#00ffd5]/10 shadow-[0_0_20px_rgba(0,255,213,0.3)]' 
            : 'border-white/20'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3 py-6">
          <div className={cn(
            "p-3 rounded-full",
            isDragActive || dragOver
              ? "bg-[#00ffd5]/20 text-[#00ffd5]"
              : "bg-white/5 text-gray-400"
          )}>
            <Upload size={28} className={isDragActive || dragOver ? "animate-bounce" : ""} />
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-300">
              {isDragActive 
                ? 'Drop your PDF files here' 
                : 'Drag & drop PDF files here'}
            </p>
            <p className="text-sm text-gray-400">
              or <span className="text-[#00ffd5] underline cursor-pointer">browse files</span> from your computer
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#00ffd5]" />
            Uploaded Files ({uploadedFiles.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {uploadedFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                className="flex items-center justify-between rounded-xl p-4 backdrop-blur-sm border border-white/10 bg-black/30 group hover:border-[#00ffd5]/30 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-[#00ffd5]/10 rounded-lg">
                    <FileText className="text-[#00ffd5]" size={18} />
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium truncate max-w-[200px] md:max-w-sm">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(file)}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-full transition-colors"
                  aria-label="Remove file"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
