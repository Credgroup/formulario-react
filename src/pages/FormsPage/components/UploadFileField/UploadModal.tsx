import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, File, X, Loader2 } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { formatFileSize } from "./utils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  maxSize?: number;
  qtd?: number;
  currentFileCount?: number;
  isLoading?: boolean;
}

export function UploadModal({
  isOpen,
  onClose,
  onFileSelect,
  acceptedTypes,
  maxSize,
  qtd,
  currentFileCount = 0,
  isLoading = false,
}: UploadModalProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setPreviewFile(file);
    
    // Criar preview se for imagem
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (previewFile) {
      onFileSelect(previewFile);
      handleClose();
    }
  }, [previewFile, onFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setPreviewFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const handleClose = useCallback(() => {
    handleRemoveFile();
    onClose();
  }, [handleRemoveFile, onClose]);

  const handleSelectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de Arquivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!previewFile ? (
            // Área de drag & drop
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Arraste e solte o arquivo aqui, ou
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSelectFile}
                  disabled={isLoading}
                >
                  Escolher arquivo
                </Button>
              </div>

              {/* Informações sobre tipos aceitos */}
              {acceptedTypes && (
                <p className="text-xs text-gray-500 mt-4">
                  Tipos aceitos: {acceptedTypes}
                </p>
              )}

              {/* Informações sobre tamanho máximo */}
              {maxSize && (
                <p className="text-xs text-gray-500">
                  Tamanho máximo por arquivo: {formatFileSize(maxSize)}
                </p>
              )}

              {/* Informações sobre limite de arquivos */}
              {qtd && (
                <p className="text-xs text-gray-500">
                  Arquivos: {currentFileCount}/{qtd}
                </p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={acceptedTypes}
                onChange={handleFileInput}
              />
            </div>
          ) : (
            // Preview do arquivo selecionado
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <File className="w-8 h-8 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {previewFile.name}
                    </span>
                    <span className="text-xs text-gray-600">
                      {formatFileSize(previewFile.size)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Preview de imagem */}
              {previewUrl && (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Confirmar'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 