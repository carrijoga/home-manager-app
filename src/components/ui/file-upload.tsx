import { File as FileIcon, UploadCloud, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Button } from './button';

export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrop'> {
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  accept?: string;
  maxSize?: number; // em bytes
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  selectedFile,
  accept,
  maxSize,
  disabled,
  className,
  ...props
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (maxSize && file.size > maxSize) {
      // Aqui pode ser adicionado um toast de erro se necessrio futuramente
      return;
    }
    onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div
      className={cn(
        'relative group flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border/60 bg-muted/30 hover:bg-muted/50 hover:border-border',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-muted/30 hover:border-border/60',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center p-6 text-center w-full">
        {selectedFile ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
              <FileIcon className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-center gap-1 overflow-hidden w-full px-4">
              <span className="text-sm font-medium truncate w-full text-center">
                {selectedFile.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-2 h-8 text-xs rounded-xl"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Remover arquivo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted-foreground/10 text-muted-foreground group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">
                Clique ou arraste um arquivo
              </span>
              <span className="text-xs text-muted-foreground">
                Selecione o arquivo para envio
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
