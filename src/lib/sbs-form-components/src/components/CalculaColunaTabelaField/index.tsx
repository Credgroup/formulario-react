import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { LucideCalculator } from "lucide-react";
import { useState, useEffect } from "react";
import type { FieldType, ColunaType } from "../../core/types";
import { dev_log } from "../../utils";
import { 
  getCleanBrlValue, 
  getCleanUsdValue, 
  getCleanPorcentagemValue,
  getCleanValue 
} from "../MaskedInput/maskUtils";

type CalculaColunaTabelaFieldProps = {
  field: Partial<FieldType>;
  restFields: Partial<FieldType>[];
  onValueChange?: (value: any) => void;
};

// Máscaras válidas para cálculo
const VALID_CALCULATION_MASKS = ["brl", "usd", "numero_decimal", "numero_inteiro", "porcentagem"];

// Função para validar se uma coluna pode ser calculada
const validateColumnForCalculation = (column: ColunaType): boolean => {
  if (column.type === "number") {
    return true;
  }
  
  if (column.type === "text" && column.mask) {
    return VALID_CALCULATION_MASKS.includes(column.mask);
  }
  
  return false;
};

// Função para remover máscara e converter para número
const removeMaskAndConvert = (value: string, mask?: string): number => {
  if (!value || value.trim() === "") {
    return 0;
  }

  let cleanValue: string;

  switch (mask) {
    case "brl":
      cleanValue = getCleanBrlValue(value);
      break;
    case "usd":
      cleanValue = getCleanUsdValue(value);
      break;
    case "porcentagem":
      cleanValue = getCleanPorcentagemValue(value);
      break;
    case "numero_decimal":
    case "numero_inteiro":
      cleanValue = getCleanValue(value);
      break;
    default:
      cleanValue = getCleanValue(value);
  }

  // Se o valor original era "0" ou similar, retornar 0
  if (value.trim() === "0" || value.trim() === "R$ 0,00" || value.trim() === "$0.00") {
    return 0;
  }

  const numericValue = parseFloat(cleanValue);
  return isNaN(numericValue) ? 0 : numericValue;
};

// Função para formatar resultado
const formatResult = (resultado: number, mask?: string): string => {
  switch (mask) {
    case "brl":
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(resultado);
    case "usd":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(resultado);
    case "porcentagem":
      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(resultado) + "%";
    case "numero_decimal":
      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(resultado);
    case "numero_inteiro":
      return new Intl.NumberFormat("pt-BR").format(resultado);
    default:
      return resultado.toString();
  }
};

// Função principal de cálculo
const calculateColumnSum = (
  field: Partial<FieldType>,
  restFields: Partial<FieldType>[]
): number => {
  try {
    // 1. Identificar campo tabela e coluna
    if (!field.findTableColunaTemplate) {
      // toast.error("Especificação da coluna não encontrada");
      return 0;
    }

    const [tableApi, columnTemplate] = field.findTableColunaTemplate.split(":");
    
    if (!tableApi || !columnTemplate) {
      // toast.error("Formato inválido para findTableColunaTemplate. Use: 'campoApiTabela:nmColunaTemplate'");
      return 0;
    }

    // Buscar a tabela específica pelo campoApi
    const tableField = restFields.find(f => f.type === "tabela" && f.campoApi === tableApi);
    
    if (!tableField) {
      // toast.error(`Tabela com campoApi '${tableApi}' não encontrada`);
      return 0;
    }
    
    dev_log(() => console.log("Campo tabela encontrado:", tableField.nome));

    // 2. Validar conteúdo da tabela
    if (!tableField.conteudo || tableField.conteudo.trim() === "") {
      // toast.error("Nenhum dado encontrado na tabela");
      return 0;
    }

    // 3. Identificar coluna
    const targetColumn = tableField.colunas?.find(
      col => col.nmColunaTemplate === columnTemplate
    );

    if (!targetColumn) {
      // toast.error(`Coluna '${columnTemplate}' não encontrada na tabela`);
      return 0;
    }

    dev_log(() => console.log("Coluna identificada:", targetColumn.nome));

    // 4. Validar se coluna pode ser calculada
    if (!validateColumnForCalculation(targetColumn)) {
      // toast.error(`Coluna '${targetColumn.nome}' não pode ser calculada. Verifique se é do tipo número ou tem máscara válida.`);
      return 0;
    }

    // 5. Processar conteúdo da tabela
    let tableData: any[] = [];
    try {
      tableData = JSON.parse(tableField.conteudo);
    } catch (error) {
      // toast.error("Erro ao processar dados da tabela");
      return 0;
    }

    if (!Array.isArray(tableData) || tableData.length === 0) {
      // toast.error("Tabela não possui dados válidos");
      return 0;
    }

    dev_log(() => console.log("Dados da tabela:", tableData));

    // 6. Calcular soma
    let total = 0;

    // Encontrar a coluna específica nos dados da tabela
    const targetColumnData = tableData.find((col: any) => col.nmColunaTemplate === columnTemplate);
    
    if (!targetColumnData || !targetColumnData.rows || !Array.isArray(targetColumnData.rows)) {
      // toast.error(`Coluna '${targetColumn.nome}' não possui dados válidos`);
      return 0;
    }

    dev_log(() => console.log("Dados da coluna encontrada:", targetColumnData.rows));

    // Iterar sobre os valores da coluna
    for (let i = 0; i < targetColumnData.rows.length; i++) {
      const value = targetColumnData.rows[i];
      
      if (!value || value.toString().trim() === "") {
        continue;
      }

      const numericValue = removeMaskAndConvert(value.toString(), targetColumn.mask);
      
      // Verificar se o valor é inválido (não é um número válido)
      if (isNaN(numericValue)) {
        // toast.error(`Erro: O conteúdo da linha ${i + 1} da coluna '${targetColumn.nome}' não pode ser calculado. Verifique se o valor é numérico.`);
        return 0;
      }

      total += numericValue;
      
      dev_log(() => console.log(`Linha ${i + 1}: ${value} -> ${numericValue}`));
    }

    dev_log(() => console.log("Total calculado:", total));
    return total;

  } catch (error) {
    dev_log(() => console.error("Erro no cálculo:", error));
    // toast.error("Erro interno no cálculo");
    return 0;
  }
};

export function CalculaColunaTabelaField({
  field,
  restFields,
  onValueChange,
}: Readonly<CalculaColunaTabelaFieldProps>) {
  const [_, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [displayValue, setDisplayValue] = useState("0");

  // Função para determinar a máscara de formatação
  const getFormatMask = () => {
    let formatMask = field.mask;
    
    if (!formatMask && field.findTableColunaTemplate) {
      const [tableApi, columnTemplate] = field.findTableColunaTemplate.split(":");
      if (tableApi && columnTemplate) {
        const tableField = restFields.find(f => f.type === "tabela" && f.campoApi === tableApi);
        const targetColumn = tableField?.colunas?.find(
          col => col.nmColunaTemplate === columnTemplate
        );
        formatMask = targetColumn?.mask;
      }
    }
    
    return formatMask;
  };

  // useEffect para atualizar displayValue quando field.conteudo mudar
  useEffect(() => {
    const formatMask = getFormatMask();
    const value = parseFloat(field.conteudo || "0");
    setDisplayValue(formatResult(value, formatMask));
  }, [field.conteudo, field.mask, field.findTableColunaTemplate, restFields]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    
    try {
      const result = calculateColumnSum(field, restFields);
      
      setHasCalculated(true);
      onValueChange?.(result);
      field.conteudo = result.toString();
      
      dev_log(() => console.log("Resultado final:", result));
      
    } catch (error) {
      dev_log(() => console.error("Erro no cálculo:", error));
      // toast.error("Erro ao calcular soma da coluna");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="w-full flex flex-row gap-2">
      <div className="relative font-bold w-full h-10 border overflow-hidden border-input flex items-center justify-start px-3 rounded-md bg-muted text-sm text-muted-foreground">
        {isCalculating ? "Calculando..." : displayValue}
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className="w-10 h-10 cursor-pointer"
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            <LucideCalculator />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Calcular</TooltipContent>
      </Tooltip>
    </div>
  );
} 