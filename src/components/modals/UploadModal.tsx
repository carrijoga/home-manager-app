import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  accept?: string;
  maxSize?: number; // em bytes
  onConfirm: (file: File) => Promise<void> | void;
  isLoading?: boolean;
}

export function UploadModal({
  open,
  onOpenChange,
  title = 'Upload de Arquivo',
  description = 'Selecione ou arraste o arquivo que deseja enviar.',
  accept,
  maxSize,
  onConfirm,
  isLoading,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!open) {
      setTimeout(() => setSelectedFile(null), 300); // Reset after closing animation
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!selectedFile) return;
    await onConfirm(selectedFile);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="py-2">
          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
            accept={accept}
            maxSize={maxSize}
            disabled={isLoading}
          />
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="w-full sm:w-auto rounded-xl"
            onClick={handleConfirm}
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? 'Enviando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
