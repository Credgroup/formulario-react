import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, File, X } from "lucide-react";
import { useState, useEffect } from "react";
import type { FieldType } from "@/types";
import { UploadModal } from "./UploadModal";
import { 
  convertFileToBase64, 
  formatFileSize, 
  validateFile, 
  convertFileDataToFileInfo,
  convertFileInfoToFileData,
  type FileData,
  type FileInfo
} from "./utils";

type UploadFileFieldProps = {
  field: Partial<FieldType>;
  onValueChange?: (value: any) => void;
};



export default function UploadFileField({
  field,
  onValueChange,
}: Readonly<UploadFileFieldProps>) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileDataList, setFileDataList] = useState<FileData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar arquivos existentes se houver
  useEffect(() => {
    if (field.conteudo) {
      try {
        // Tentar fazer parse do JSON
        const fileInfoList: FileInfo[] = JSON.parse(field.conteudo);
        
        if (Array.isArray(fileInfoList)) {
          const fileDataList = fileInfoList.map(fileInfo => 
            convertFileInfoToFileData(fileInfo)
          );
          setFileDataList(fileDataList);
        }
      } catch (error) {
        // Se não for JSON válido, pode ser um base64 antigo (compatibilidade)
        if (field.conteudo.startsWith('data:')) {
          const arr = field.conteudo.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1];
          const filename = field.nome || 'arquivo';
          
          const fileData: FileData = {
            name: filename,
            size: 0,
            type: mime || 'application/octet-stream',
            lastModified: Date.now(),
            base64: field.conteudo
          };
          setFileDataList([fileData]);
        }
      }
    }
  }, [field.conteudo, field.nome]);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    
    try {
      // Validar arquivo
      const error = validateFile(file, field.uploadAccepts, field.uploadMaxSize);
      if (error) {
        toast.error(error);
        return;
      }

      // Verificar limite de arquivos
      const qtd = field.qtd || 1;
      if (fileDataList.length >= qtd) {
        toast.error(`Limite máximo de ${qtd} arquivo(s) atingido`);
        return;
      }

      // Converter para base64
      const base64 = await convertFileToBase64(file);
      
      const newFileData: FileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        base64: base64
      };

      const updatedFileDataList = [...fileDataList, newFileData];
      setFileDataList(updatedFileDataList);
      
      // Converter para FileInfo e salvar como JSON
      const fileInfoList = convertFileDataToFileInfo(updatedFileDataList);
      const jsonValue = JSON.stringify(fileInfoList);
      
      // Atualizar o valor do campo
      field.conteudo = jsonValue;
      onValueChange?.(jsonValue);
      
      toast.success('Arquivo adicionado com sucesso!');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Erro ao processar arquivo');
      console.error('Erro ao processar arquivo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    const updatedFileDataList = fileDataList.filter((_, i) => i !== index);
    setFileDataList(updatedFileDataList);
    
    if (updatedFileDataList.length === 0) {
      field.conteudo = '';
      onValueChange?.('');
    } else {
      const fileInfoList = convertFileDataToFileInfo(updatedFileDataList);
      const jsonValue = JSON.stringify(fileInfoList);
      field.conteudo = jsonValue;
      onValueChange?.(jsonValue);
    }
    
    toast.success('Arquivo removido');
  };

  const handleRemoveAllFiles = () => {
    setFileDataList([]);
    field.conteudo = '';
    onValueChange?.('');
    toast.success('Todos os arquivos removidos');
  };

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <div className="flex flex-col items-start gap-y-2 justify-start w-full">

      <div className="w-full">
        {fileDataList.length > 0 ? (
          // Arquivos selecionados
          <div className="space-y-2">
            {fileDataList.map((fileData, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-green-200 rounded-md bg-green-50">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-green-600" />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-green-800">
                      {fileData.name}
                    </span>
                    <span className="text-xs text-green-600">
                      {formatFileSize(fileData.size)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            {/* Botão para adicionar mais arquivos */}
            {(!field.qtd || fileDataList.length < field.qtd) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleModalOpen}
                disabled={isLoading}
                className="w-full h-10 border-dashed border-2 hover:border-solid"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isLoading ? 'Processando...' : 'Adicionar mais arquivos'}
              </Button>
            )}
            
            {/* Botão para remover todos */}
            {fileDataList.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleRemoveAllFiles}
                className="w-full text-red-600 hover:text-red-700"
              >
                Remover todos os arquivos
              </Button>
            )}
          </div>
        ) : (
          // Botão de upload inicial
          <Button
            type="button"
            variant="outline"
            onClick={handleModalOpen}
            disabled={isLoading}
            className="w-full h-12 border-dashed border-2 hover:border-solid"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? 'Processando...' : 'Selecionar arquivo'}
          </Button>
        )}
      </div>

      {/* Informações sobre tipos aceitos */}
      {field.uploadAccepts && (
        <p className="text-xs text-muted-foreground">
          Tipos aceitos: {field.uploadAccepts}
        </p>
      )}

      {/* Informações sobre tamanho máximo */}
      {field.uploadMaxSize && (
        <p className="text-xs text-muted-foreground">
          Tamanho máximo por arquivo: {formatFileSize(field.uploadMaxSize)}
        </p>
      )}

      {/* Informações sobre limite de arquivos */}
      {field.qtd && (
        <p className="text-xs text-muted-foreground">
          Máximo de {field.qtd} arquivo(s) permitido(s)
        </p>
      )}

      <UploadModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onFileSelect={handleFileSelect}
        acceptedTypes={field.uploadAccepts}
        maxSize={field.uploadMaxSize}
        qtd={field.qtd}
        currentFileCount={fileDataList.length}
        isLoading={isLoading}
      />
    </div>
  );
}