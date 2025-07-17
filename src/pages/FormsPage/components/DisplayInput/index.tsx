import type { FieldType } from "@/types";
import { Label } from "@radix-ui/react-label";
import { format } from "@react-input/mask";
import { getMaskPattern } from "../GenericField";
import TableGridContainer from "../TableField/TableGridContainer";
import { Badge } from "@/components/ui/badge";
import { File } from "lucide-react";

// Função para formatar valores monetários (copiada do GenericField)
const formatResult = (resultado: number, mask?: string): string => {
  switch (mask) {
    case "BRL":
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(resultado);
    case "USD":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(resultado);
    case "decimal":
    default:
      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(resultado);
  }
};

type DisplayInputProps = {
  field: Partial<FieldType>;
};

// Função para aplicar máscara em valores de exibição
const applyMaskToValue = (value: string | undefined, mask?: string): string => {
  if (!value || !mask) return value ?? "--";
  
  const maskPattern = getMaskPattern(mask);
  if (!maskPattern) return value;
  
  if (maskPattern === "currency") {
    const numericValue = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (isNaN(numericValue)) return value;
    return formatResult(numericValue, mask);
  }
  
  try {
    const options = {
      mask: maskPattern,
      replacement: {
        a: /[a-zA-Z]/,
        "*": /[a-zA-Z0-9]/,
        _: /./,
      },
      showMask: false,
    };
    return format(value, options);
  } catch {
    return value;
  }
};

// Função para renderizar tabela em modo readOnly
const renderTableContent = (field: Partial<FieldType>) => {
  if (!field.conteudo) return "--";
  
  try {
    const tableData = JSON.parse(field.conteudo);
    if (!Array.isArray(tableData) || tableData.length === 0) return "--";
    
    const colunas = tableData.map((col: any) => ({
      id: col.id || col.nmColumn,
      nmColumn: col.nmColumn || col.nome || "Coluna",
      namedTo: col.namedTo || "",
      rows: col.rows || [],
      colunaField: field.colunas?.find((c: any) => c.id === col.id),
      onEditCell: undefined // Sem edição em modo readOnly
    }));
    
    return (
      <div className="w-full max-w-full max-h-[284px] overflow-hidden relative">
        <TableGridContainer 
          colunas={colunas} 
          readOnly={true} 
        />
        {/* Gradiente na base */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-zinc-100/80 to-transparent" />
        {/* Gradiente na lateral direita */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-zinc-100/80 to-transparent" />
      </div>
    );
  } catch {
    return field.conteudo;
  }
};

// Função para renderizar arquivos em modo readOnly
const renderFileContent = (field: Partial<FieldType>) => {
  if (!field.conteudo) return "--";
  
  try {
    // Tentar fazer parse do JSON (novo formato)
    const fileInfoList = JSON.parse(field.conteudo);
    
    if (Array.isArray(fileInfoList) && fileInfoList.length > 0) {
      return (
        <div className="flex flex-wrap gap-2">
          {fileInfoList.map((fileInfo: any, index: number) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              <File className="w-3 h-3" />
              <span className="text-xs">{fileInfo.nomeArquivo}</span>
            </Badge>
          ))}
        </div>
      );
    }
  } catch (error) {
    // Se não for JSON válido, pode ser um base64 antigo (compatibilidade)
    if (field.conteudo.startsWith('data:')) {
      const filename = field.nome || 'arquivo';
      return (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <File className="w-3 h-3" />
            <span className="text-xs">{filename}</span>
          </Badge>
        </div>
      );
    }
  }
  
  return "--";
};

const renderCondicionalContent = (field: Partial<FieldType>) => {

  if (!field.conteudo) return "--";
  const value = JSON.parse(field.conteudo);

  if(value.length === 0){
    return "--";
  }else{
    return value.map((item: any) => item.conteudo).join(", ");
  }

};

export default function DisplayInput({ field }: Readonly<DisplayInputProps>) {
  // Renderiza tabela se for do tipo tabela
  if (field.type === "tabela") {
    return (
      <div className="flex flex-col gap-1 w-full md:col-span-2">
        <div>
          <span className="text-sm font-semibold text-zinc-500">
            {field.nome}
          </span>
          {field.obrigatorio && (
            <span className="text-red-500 text-lg ml-1">*</span>
          )}
        </div>
        <div className="mt-2">
          {renderTableContent(field)}
        </div>
      </div>
    );
  }

  // Renderiza arquivos se for do tipo file
  if (field.type === "file") {
    console.log("field", field);
    console.log("AAAAAAAAAAAAAAAAAA")
    return (
      <div className="flex flex-col gap-1">
        <div>
          <span className="text-sm font-semibold text-zinc-500">
            {field.nome}
          </span>
          {field.obrigatorio && (
            <span className="text-red-500 text-lg ml-1">*</span>
          )}
        </div>
        <div className="mt-1">
          {renderFileContent(field)}
        </div>
      </div>
    );
  }

  if(field.type === "condicional") {
    return (
      <Label>
      <div className="flex flex-col gap-1">
        <div>
          <span className="text-sm font-semibold text-zinc-500">
            {field.nome}
          </span>
          {field.obrigatorio && (
            <span className="text-red-500 text-lg ml-1">*</span>
          )}
        </div>
        <span className="font-semibold text-zinc-900">
          {renderCondicionalContent(field)}
        </span>
      </div>
    </Label>
    );
  }

  // Para outros tipos, aplica máscara se necessário
  const displayValue = applyMaskToValue(field.conteudo, field.mask);

  return (
    <Label>
      <div className="flex flex-col gap-1">
        <div>
          <span className="text-sm font-semibold text-zinc-500">
            {field.nome}
          </span>
          {field.obrigatorio && (
            <span className="text-red-500 text-lg ml-1">*</span>
          )}
        </div>
        <span className="font-semibold text-zinc-900">
          {displayValue || "--"}
        </span>
      </div>
    </Label>
  );
}
