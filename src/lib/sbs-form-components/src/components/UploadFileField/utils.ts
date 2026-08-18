// Função para converter File para base64
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Função para converter base64 de volta para File (para uso na API)
export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// Função para formatar tamanho de arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Função para validar arquivo
export const validateFile = (
  file: File, 
  acceptedTypes?: string, 
  maxSize?: number
): string | null => {
  // Validar tipo de arquivo
  if (acceptedTypes) {
    const acceptedTypesArray = acceptedTypes.split(',').map(type => type.trim());
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    const isAccepted = acceptedTypesArray.some(type => {
      if (type.includes('*')) {
        // Padrão como "image/*"
        const baseType = type.split('/')[0];
        return fileType.startsWith(baseType + '/');
      } else if (type.startsWith('.')) {
        // Extensão como ".pdf"
        return fileExtension === type.toLowerCase();
      } else {
        // MIME type completo
        return fileType === type;
      }
    });
    
    if (!isAccepted) {
      return `Tipo de arquivo não suportado. Tipos aceitos: ${acceptedTypes}`;
    }
  }
  
  // Validar tamanho
  if (maxSize && file.size > maxSize) {
    const maxSizeFormatted = formatFileSize(maxSize);
    const fileSizeFormatted = formatFileSize(file.size);
    return `Arquivo muito grande. Tamanho máximo: ${maxSizeFormatted}. Arquivo: ${fileSizeFormatted}`;
  }
  
  return null;
};

// Interface para dados do arquivo
export interface FileData {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  base64: string;
}

// Interface para arquivo simplificado (para armazenamento)
export interface FileInfo {
  nomeArquivo: string;
  base64: string;
}

// Função para converter array de FileData para FileInfo
export const convertFileDataToFileInfo = (files: FileData[]): FileInfo[] => {
  return files.map(file => ({
    nomeArquivo: file.name,
    base64: file.base64
  }));
};

// Função para converter FileInfo de volta para FileData (para preview)
export const convertFileInfoToFileData = (fileInfo: FileInfo): FileData => {
  return {
    name: fileInfo.nomeArquivo,
    size: 0, // Não podemos recuperar o tamanho original
    type: '', // Não podemos recuperar o tipo original
    lastModified: Date.now(),
    base64: fileInfo.base64
  };
}; 