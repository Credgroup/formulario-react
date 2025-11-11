import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FieldType, TpOptions } from "@/types";
import { format, parseISO } from "date-fns";
import { LucideCalculator } from "lucide-react";
import { useEffect, useState, useCallback, memo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { evaluate } from "mathjs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import MaskedInput, { type MaskType } from "../MaskedInput";
import { CustomDatePicker } from "../CustomDatePicker";
import ComboCheckbox from "../ComboCheckbox";
import { Textarea } from "@/components/ui/textarea";
import { dev_log } from "@/lib/utils";
import { MultipleResponsesField } from "../MultipleResponsesField";
import TableField from "../TableField";
import CondicionalField from "../CondicionalField";
import UploadFileField from "../UploadFileField";
import CalculaColunaTabelaField from "../CalculaColunaTabelaField";
import { MASK_TYPES } from "../MaskedInput/maskUtils";
import { useFieldApi } from "@/hooks/useFieldApi";
import { ApiFieldWrapper } from "../ApiFieldWrapper";

type GenericFieldProps = {
  field: Partial<FieldType>;
  restFields: Partial<FieldType>[];
  onValueChange?: (value: any) => void;
  onFieldUpdate?: (targetName: string, newValue: string) => void;
};

const getValue = (field: Partial<FieldType>) => {
  if (field.type === "date") {
    return field.conteudo ? parseISO(field.conteudo) : undefined;
  }
};

export const formatOptions = (options: string) => {
  if (!options) return [];
  try {
    return options
      .split(";")
      .map((option) => {
        const [label, value] = option.split(":").map((str) => str?.trim());
        if (label && value) {
          return { label, value };
        }
        return null;
      })
      .filter((opt): opt is TpOptions => opt !== null);
  } catch (error) {
    toast.error("Erro ao formatar opções");
    console.log(error);
    dev_log(() => console.error("Erro ao formatar opções:", error));
    return [];
  }
};

export const getMaskPattern = (
  inputMask?: string,
): MaskType | undefined => {
  // verify if inputMask is a valid mask
  if(inputMask && MASK_TYPES.find(mask => mask === inputMask)) {
    return inputMask as MaskType;
  }
};

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

function removeMask(value: string | number | undefined, field: Partial<FieldType>){
  // Se o valor não for string, retorna o valor como string
  if (typeof value !== 'string') {
    return value?.toString() || '';
  }
  
  // Se for string e tem mask, remove a mask
  if(value && field.mask){
    return value.replace(/[^\w\s]/gi, '')
  }
  return value
}

function GenericField({
  field,
  restFields,
  onValueChange,
  onFieldUpdate,
}: Readonly<GenericFieldProps>) {
  const [value, setValue] = useState<string>(removeMask(field.conteudo, field) ?? "");
  const [date, setDate] = useState<Date | undefined>(getValue(field));
  const [options, setOptions] = useState<TpOptions[] | undefined>([]);
  const [mathResult, setMathResult] = useState<string | undefined>(
    field.conteudo ?? ""
  );
  const [hasCalculated, setHasCalculated] = useState(false);
  const [apiCallTimeout, setApiCallTimeout] = useState<NodeJS.Timeout | null>(null);
  const { callFieldApi, loadingFields } = useFieldApi();
  const lastApiCallRef = useRef<string>("");
  const isUpdatingFromParentRef = useRef(false);
  const fieldValueRef = useRef<string>(removeMask(field.conteudo, field) ?? "");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Estados para controle da API
  // Os indicadores permanecem visíveis até a próxima chamada da API
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiErrorMessage, setApiErrorMessage] = useState<string>('');

  // Função de debounce para inputs
  const debouncedOnValueChange = useCallback((newValue: string) => {
    // Limpa timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Cria novo timeout
    debounceTimeoutRef.current = setTimeout(() => {
      onValueChange?.(newValue);
    }, 150); // 150ms de debounce natural
  }, [onValueChange]);

  const handleFieldUpdate = useCallback((targetName: string, newValue: string) => {
    // Só atualiza se o campo tem target e o targetName corresponde
    if ((field as any).target === targetName) {
      console.log(`[GenericField] handleFieldUpdate: targetName="${targetName}", newValue="${newValue}"`);
      isUpdatingFromParentRef.current = true;
      setValue(newValue);
      fieldValueRef.current = newValue;
      // Reset flag imediatamente
      isUpdatingFromParentRef.current = false;
      // Limpa a referência da última chamada de API para permitir nova chamada se necessário
      lastApiCallRef.current = "";
    }
  }, [(field as any).target]);

  // Sincronização bidirecional de estado - Otimizada para performance
  useEffect(() => {
    // Para campos de data, sincroniza o estado date
    if (field.type === "date") {
      const fieldDate = field.conteudo ? parseISO(field.conteudo) : undefined;
      if (fieldDate && fieldDate.getTime() !== date?.getTime() && !isUpdatingFromParentRef.current) {
        isUpdatingFromParentRef.current = true;
        setDate(fieldDate);
        isUpdatingFromParentRef.current = false;
      }
    } else {
      // Para outros campos, sincroniza o valor normal
      const fieldValue = removeMask(field.conteudo, field) ?? "";
      if (fieldValue !== fieldValueRef.current && !isUpdatingFromParentRef.current) {
        isUpdatingFromParentRef.current = true;
        setValue(fieldValue.toString());
        fieldValueRef.current = fieldValue.toString();
        isUpdatingFromParentRef.current = false;
      }
    }
  }, [field.conteudo, field.mask, field.type, date]);

  // Chamada de API quando campo está completo - Otimizada para evitar loops
  useEffect(() => {
    if (field.apiConfig && value && isFieldComplete(field, value)) {
      // Verifica se o campo não está em loading para evitar chamadas repetidas
      const isCurrentlyLoading = loadingFields.includes(field.campoApi!);
      
      // Verifica se já fizemos a chamada para este valor
      if (!isCurrentlyLoading && lastApiCallRef.current !== value) {
        // Limpa timeout anterior se existir
        if (apiCallTimeout) {
          clearTimeout(apiCallTimeout);
        }
        
        // Cria novo timeout para debounce
        const timeout = setTimeout(() => {
          lastApiCallRef.current = value;
          setApiStatus('loading');
          setApiErrorMessage('');
          
          // Chama a API com callback personalizado para controlar o status
          callFieldApi(
            field, 
            value, 
            restFields, 
            (targetName: string, newValue: string) => {
              // Atualiza o campo
              (onFieldUpdate || handleFieldUpdate)(targetName, newValue);
              // Marca como sucesso - permanece até próxima chamada
              setApiStatus('success');
            }
          ).catch((error) => {
            // Em caso de erro - permanece até próxima chamada
            setApiStatus('error');
            setApiErrorMessage(error.message || 'Erro ao buscar dados');
          });
        }, 300); // 300ms de debounce (reduzido para melhor responsividade)
        
        setApiCallTimeout(timeout);
      }
    } else if (field.apiConfig && value && !isFieldComplete(field, value)) {
      // Reset status apenas quando o campo tem valor mas não está completo
      // (ex: CEP com menos de 8 dígitos)
      setApiStatus('idle');
      setApiErrorMessage('');
    }
    
    // Cleanup do timeout
    return () => {
      if (apiCallTimeout) {
        clearTimeout(apiCallTimeout);
      }
    };
  }, [value, (field as any).apiConfig?.type, field.campoApi, loadingFields]);

  // Cleanup do debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const isFieldComplete = useCallback((field: Partial<FieldType>, value: string) => {
    if (field.mask === 'cep') {
      const cleanValue = value.replace(/\D/g, '');
      return cleanValue.length === 8;
    }
    return value && value.length > 0;
  }, []);
  
  useEffect(() => {
    if (date && !isUpdatingFromParentRef.current) {
      const dateFormated = format(date, "yyyy-MM-dd");
      onValueChange?.(dateFormated);
    }
  }, [date, onValueChange]);

  useEffect(() => {
    if (field.type === "select" && !Array.isArray(field.options)) {
      dev_log(() => console.log("field", field));
      const opt = formatOptions(field.options ?? "");
      setOptions(opt);
    }
  }, []);

  const testCalc = () => {
    if (field.type === "calculado" && field.calculo) {
      const regex = /{{(.*?)}}/g;
      const variaveis = [...field.calculo.matchAll(regex)].map((m) => m[1]);

      const scope = variaveis.reduce((acc, nomeVar) => {
        const campo = restFields.find((f) => f.campoApi === nomeVar);
        const valorNumerico = Number(campo?.conteudo);
        acc[nomeVar] = isNaN(valorNumerico) ? 0 : valorNumerico;
        return acc;
      }, {} as Record<string, number>);

      if (Object.keys(scope).length === 0) {
        toast.error("Erro de cálculo: nenhuma variável encontrada.");
        return;
      }

      const expressao = field.calculo.replace(
        /{{(.*?)}}/g,
        (_, nomeVar) => nomeVar
      );

      try {
        dev_log(() => console.log("Expressão:", expressao));
        dev_log(() => console.log("Variáveis:", variaveis));
        dev_log(() => console.log("Escopo:", scope));
        dev_log(() =>
          console.log(field.calculo?.trim() === `{{${variaveis[0]}}}`)
        );
        if (
          variaveis.length === 1 &&
          field.calculo.trim() === `{{${variaveis[0]}}}`
        ) {
          dev_log(() =>
            console.log("A expressão é uma única variável:", variaveis[0])
          );
          const newValue = scope[variaveis[0]];
          setMathResult(newValue.toString());
          setValue(newValue.toString());
          onValueChange?.(newValue.toString());
          setHasCalculated(true);
          return;
        }

        const resultado = evaluate(expressao, scope);
        setMathResult(resultado.toString());
        setValue(resultado.toString());
        onValueChange?.(resultado.toString());
        setHasCalculated(true);
      } catch (e) {
        toast.error(`Erro ao calcular expressão: ${e}`);
        setMathResult("0");
      }
    }
  };

  return (
    <div className="flex flex-col items-start gap-y-2 justify-start w-full">
      {field.type !== "checkbox" && field.type !== "condicional" && (
        <Label htmlFor={field.campoApi} className="relative leading-6 w-full">
          {field.nome}
          {field.obrigatorio && (
            <span className="relative text-red-500 text-lg -left-1">*</span>
          )}
        </Label>
      )}
      {field.type === "select" &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
        <Select onValueChange={(newValue) => {
          setValue(newValue);
          fieldValueRef.current = newValue;
          debouncedOnValueChange(newValue);
        }} value={value}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options &&
              options.length > 0 &&
              options.map((option) => (
                <SelectItem key={uuidv4()} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}
      {field.type === "date" &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
        <CustomDatePicker field={field} date={date} setDate={setDate} />
      )}
      {field.type === "combo_checkbox" &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
        <ComboCheckbox field={field} onValueChange={(newValue) => {
          setValue(newValue);
          fieldValueRef.current = newValue;
          debouncedOnValueChange(newValue);
        }} />
      )}
      {field.type === "textarea" &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
        <Textarea
          id={field.campoApi}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            setValue(newValue);
            fieldValueRef.current = newValue;
            debouncedOnValueChange(newValue);
          }}
          placeholder={field.placeholder}
          className="w-full h-24 resize-none"
          disabled={!!field.desabilitar}
          maxLength={field.tamanho ? parseInt(field.tamanho) : 999}
        />
      )}
      {field.type === "checkbox" &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
        <div className="flex items-center justify-start gap-3 w-full">
          <Label
            htmlFor={field.campoApi}
            className="leading-6 w-full cursor-pointer"
          >
            <Checkbox
              id={field.campoApi}
              onCheckedChange={(e) => {
                const newValue = e.toString();
                setValue(newValue);
                fieldValueRef.current = newValue;
                debouncedOnValueChange(newValue);
              }}
              className="w-5 h-5"
              defaultChecked={field.conteudo === "true"}
            />

            {field.nome}
            {field.obrigatorio && (
              <span className="relative text-red-500 text-lg -left-1">*</span>
            )}
          </Label>
        </div>
      )}
      {field.type === "email" &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
        <Input
          type={field.type}
          id={field.campoApi}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            setValue(newValue);
            fieldValueRef.current = newValue;
            debouncedOnValueChange(newValue);
          }}
        />
      )}
      {field.type === "number" &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
        <Input
          type={field.type}
          id={field.campoApi}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            setValue(newValue);
            fieldValueRef.current = newValue;
            debouncedOnValueChange(newValue);
          }}
          min={0}
        />
      )}

      {field.type === "text" &&
        field.mask && getMaskPattern(field.mask) !== undefined &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
            <ApiFieldWrapper
              apiStatus={apiStatus} 
              errorMessage={apiErrorMessage}
            >
              <MaskedInput
                value={value}
                onChange={(newValue) => {
                  setValue(newValue);
                  fieldValueRef.current = newValue;
                  debouncedOnValueChange(newValue);
                }}
                mask={field.mask as MaskType}
                id={field.campoApi}
                placeholder={field.placeholder}
                disabled={apiStatus === 'loading' || !!field.desabilitar}
              />
            </ApiFieldWrapper>
        )}

      {field.type === "text" &&
        (!field.mask || getMaskPattern(field.mask) === undefined) &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
            <ApiFieldWrapper 
              apiStatus={apiStatus} 
              errorMessage={apiErrorMessage}
            >
              <Input
                type="text"
                id={field.campoApi}
                maxLength={field.tamanho ? parseInt(field.tamanho) : 999}
                value={value}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setValue(newValue);
                  fieldValueRef.current = newValue;
                  debouncedOnValueChange(newValue);
                }}
                placeholder={field.placeholder}
                disabled={apiStatus === 'loading' || !!field.desabilitar}
              />
            </ApiFieldWrapper>
        )}

      {/* Campo de múltiplas respostas */}
      {field.type !== "tabela" && field.qtdRespostas && field.qtdRespostas > 1 && (
        <MultipleResponsesField
          field={field}
          onValueChange={(newValue) => {
            setValue(newValue);
            fieldValueRef.current = newValue;
            debouncedOnValueChange(newValue);
          }}
          restFields={restFields}
        />
      )}

      {field.type === "tabela" && (
        <TableField field={field} onValueChange={(newValue) => {
          setValue(newValue);
          fieldValueRef.current = newValue;
          debouncedOnValueChange(newValue);
        }} restFields={restFields} />
      )}

      {field.type === "condicional" && (
        <CondicionalField field={field} onValueChange={(newValue) => {
          setValue(newValue);
          fieldValueRef.current = newValue;
          debouncedOnValueChange(newValue);
        }} restFields={restFields} />
      )}

      {field.type === "file" && (
        <UploadFileField field={field} onValueChange={(newValue) => {
          setValue(newValue);
          fieldValueRef.current = newValue;
          debouncedOnValueChange(newValue);
        }} />
      )}

      {field.type === "calculado" && (
        <div className="w-full flex flex-row gap-2">
          <div className="relative font-bold w-full h-10 border overflow-hidden border-input flex items-center justify-start px-3 rounded-md bg-muted text-sm text-muted-foreground">
            {hasCalculated
              ? formatResult(parseFloat(mathResult ?? "0"), field.mask)
              : formatResult(parseFloat(field.conteudo ?? "0"), field.mask)}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="w-10 h-10 cursor-pointer"
                onClick={testCalc}
              >
                <LucideCalculator />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Calcular</TooltipContent>
          </Tooltip>
        </div>
      )}

      {field.type === "calcula_coluna_tabela" && (
        <CalculaColunaTabelaField 
          field={field} 
          restFields={restFields} 
          onValueChange={(newValue) => {
            setValue(newValue);
            fieldValueRef.current = newValue;
            debouncedOnValueChange(newValue);
          }} 
        />
      )}
    </div>
  );
}

// Memoiza o componente para evitar re-renderizações desnecessárias
export default memo(GenericField, (prevProps, nextProps) => {
  // Só re-renderiza se o campo realmente mudou
  return (
    prevProps.field.conteudo === nextProps.field.conteudo &&
    prevProps.field.campoApi === nextProps.field.campoApi &&
    prevProps.field.nome === nextProps.field.nome &&
    prevProps.field.type === nextProps.field.type &&
    prevProps.field.mask === nextProps.field.mask &&
    prevProps.field.obrigatorio === nextProps.field.obrigatorio &&
    prevProps.field.desabilitar === nextProps.field.desabilitar &&
    prevProps.field.placeholder === nextProps.field.placeholder &&
    prevProps.field.tamanho === nextProps.field.tamanho &&
    prevProps.field.options === nextProps.field.options &&
    prevProps.field.calculo === nextProps.field.calculo &&
    (prevProps.field as any).apiConfig === (nextProps.field as any).apiConfig &&
    prevProps.field.qtdRespostas === nextProps.field.qtdRespostas &&
    prevProps.field.visual === nextProps.field.visual &&
    prevProps.field.sessao === nextProps.field.sessao &&
    prevProps.field.dsTitulo === nextProps.field.dsTitulo &&
    prevProps.field.dsSubtitulo === nextProps.field.dsSubtitulo &&
    prevProps.field.type === nextProps.field.type &&
    prevProps.restFields === nextProps.restFields &&
    prevProps.onValueChange === nextProps.onValueChange &&
    prevProps.onFieldUpdate === nextProps.onFieldUpdate
  );
});
