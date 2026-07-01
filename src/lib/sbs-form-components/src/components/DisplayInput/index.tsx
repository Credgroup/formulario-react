import type { FieldType } from "../../core/types";
import { Label } from "@radix-ui/react-label";
import { getMaskPattern } from "../GenericField";
import TableGridContainer from "../TableField/TableGridContainer";
import { Badge } from "../ui/badge";
import { File } from "lucide-react";
import { applyMask } from "../MaskedInput/maskUtils";



type DisplayInputProps = {
  field: Partial<FieldType>;
};

// Função para obter o label correspondente ao valor selecionado no select
const getSelectLabel = (field: Partial<FieldType>): string => {
  const value = field.conteudo;
  if (value === undefined || value === null) return "--";

  const options = field.options;
  if (!options) return String(value);

  let parsedOptions: { label: string; value: string }[] = [];

  if (Array.isArray(options)) {
    parsedOptions = options;
  } else if (typeof options === "string") {
    try {
      parsedOptions = options
        .split(";")
        .map((option) => {
          const [label, val] = option.split(":").map((str) => str?.trim());
          if (label && val) {
            return { label, value: val };
          }
          return null;
        })
        .filter((opt): opt is { label: string; value: string } => opt !== null);
    } catch {
      return String(value);
    }
  }

  const foundOption = parsedOptions.find(
    (opt) => String(opt.value) === String(value)
  );
  return foundOption ? foundOption.label : String(value);
};

// Função para aplicar máscara em valores de exibição
const applyMaskToValue = (value: string | undefined, mask?: string): string => {
  if (!value || !mask) return value ?? "--";
  
  // Trata formato de data ISO "YYYY-MM-DD"
  if (mask === "data" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  // Trata formato de data e hora ISO "YYYY-MM-DDTHH:mm..."
  if (mask === "data_hora" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
    const parts = value.split("T");
    const [year, month, day] = parts[0].split("-");
    const time = parts[1].substring(0, 5);
    return `${day}/${month}/${year} ${time}`;
  }
  
  const maskType = getMaskPattern(mask);
  if (!maskType) return value;
  
  try {
    // Usa nossa função applyMask do sistema de máscaras
    return applyMask(value, maskType);
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
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-zinc-100/80 dark:from-zinc-900/70 to-transparent" />
        {/* Gradiente na lateral direita */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-zinc-100/80 dark:from-zinc-900/70 to-transparent" />
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

// Função para renderizar campos com múltiplas respostas (qtdRespostas)
const renderMultipleResponsesContent = (field: Partial<FieldType>) => {
  if (!field.conteudo) return "--";
  
  try {
    const responses = JSON.parse(field.conteudo);
    if (!Array.isArray(responses) || responses.length === 0) return "--";
    
    // Extrair apenas os conteúdos das respostas
    const contents = responses.map((response: any) => response.conteudo).filter(Boolean);
    
    if (contents.length === 0) return "--";
    
    // Renderizar como badges
    return (
      <div className="flex flex-wrap gap-2">
        {contents.map((content: string, index: number) => (
          <Badge key={index} variant="outline" className="text-xs">
            {content}
          </Badge>
        ))}
      </div>
    );
  } catch (error) {
    // Se não for JSON válido, retorna o conteúdo original
    return field.conteudo;
  }
};

export function DisplayInput({ field }: Readonly<DisplayInputProps>) {
  // Renderiza múltiplas respostas se o campo tem qtdRespostas
  if (field.qtdRespostas && field.qtdRespostas > 1) {
    return (
      <div className="flex flex-col gap-1">
        <div>
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {field.nome}
          </span>
          {field.obrigatorio && (
            <span className="text-red-500 text-lg ml-1">*</span>
          )}
        </div>
        <div className="mt-1">
          {renderMultipleResponsesContent(field)}
        </div>
      </div>
    );
  }

  // Renderiza tabela se for do tipo tabela
  if (field.type === "tabela") {
    return (
      <div className="flex flex-col gap-1 w-full md:col-span-full">
        <div>
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
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
    return (
      <div className="flex flex-col gap-1">
        <div>
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
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
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {field.nome}
          </span>
          {field.obrigatorio && (
            <span className="text-red-500 text-lg ml-1">*</span>
          )}
        </div>
        <span className="font-semibold text-zinc-800 dark:text-zinc-100">
          {renderCondicionalContent(field)}
        </span>
      </div>
    </Label>
    );
  }

  // Para outros tipos, aplica máscara se necessário
  let displayValue = field.conteudo ?? "--";
  if (field.type === "select") {
    displayValue = getSelectLabel(field);
  } else {
    displayValue = applyMaskToValue(field.conteudo, field.mask);
  }

  return (
    <Label>
      <div className="flex flex-col gap-1">
        <div>
          <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {field.nome}
          </span>
          {field.obrigatorio && (
            <span className="text-red-500 text-lg ml-1">*</span>
          )}
        </div>
        <span className="font-semibold text-zinc-800 dark:text-zinc-100">
          {displayValue || "--"}
        </span>
      </div>
    </Label>
  );
}
