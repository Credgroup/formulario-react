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
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { evaluate } from "mathjs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CurrencyInput } from "../CurrencyInput";
import MaskedInput from "../MaskedInput";
import { CustomDatePicker } from "../CustomDatePicker";
import ComboCheckbox from "../ComboCheckbox";
import { Textarea } from "@/components/ui/textarea";
import { dev_log } from "@/lib/utils";
import { MultipleResponsesField } from "../MultipleResponsesField";
import TableField from "../TableField";

type GenericFieldProps = {
  field: Partial<FieldType>;
  restFields: Partial<FieldType>[];
  onValueChange?: (value: any) => void;
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
  maskType?: string,
  inputObj?: Partial<FieldType>
): string | undefined => {
  switch (maskType) {
    case "cpf":
      return "___.___.___-__";
    case "cnpj":
      return "__.___.___/____-__";
    case "telefone":
      return "(__) _____-____";
    case "rg":
      return "__.___.___-__";
    case "cep":
      return "_____-___";
    case "BRL":
    case "USD":
      return "currency";
    default:
      dev_log(() => console.log("inputObj", inputObj));
      dev_log(() => console.log(`Máscara desconhecida: ${maskType}`));
      return undefined;
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

function removeMask(string: string | undefined, field: Partial<FieldType>){
  if(string && field.mask){
    return string?.replace(/[^\w\s]/gi, '')
  }
  return string
}

export default function GenericField({
  field,
  restFields,
  onValueChange,
}: Readonly<GenericFieldProps>) {
  const [value, setValue] = useState<any>(removeMask(field.conteudo, field));
  const [date, setDate] = useState<Date | undefined>(getValue(field));
  const [options, setOptions] = useState<TpOptions[] | undefined>([]);
  const [mathResult, setMathResult] = useState<string | undefined>(
    field.conteudo ?? ""
  );
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    field.conteudo = value;
    onValueChange?.(value);
  }, [value]);

  useEffect(() => {
    if (date) {
      const dateFormated = format(date, "yyyy-MM-dd");
      field.conteudo = dateFormated;
      onValueChange?.(dateFormated);
    }
  }, [date]);

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
          setMathResult(scope[variaveis[0]].toString());
          setValue(scope[variaveis[0]]);
          setHasCalculated(true);
          return;
        }

        const resultado = evaluate(expressao, scope);
        setMathResult(resultado.toString());
        setValue(resultado);
        setHasCalculated(true);
      } catch (e) {
        toast.error(`Erro ao calcular expressão: ${e}`);
        setMathResult("0");
      }
    }
  };

  return (
    <div className="flex flex-col items-start gap-y-2 justify-start w-full">
      {field.type !== "checkbox" && (
        <Label htmlFor={field.campoApi} className="relative leading-6 w-full">
          {field.nome}
          {field.obrigatorio && (
            <span className="relative text-red-500 text-lg -left-1">*</span>
          )}
        </Label>
      )}
      {field.type === "select" &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
        <Select onValueChange={setValue} defaultValue={field.conteudo ?? ""}>
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
        <ComboCheckbox field={field} onValueChange={setValue} />
      )}
      {field.type === "textarea" &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
        <Textarea
          id={field.campoApi}
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
              onCheckedChange={(e) => setValue(e.toString())}
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
          onChange={(e) => setValue(e.target.value)}
        />
      )}
      {field.type === "number" &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
        <Input
          type={field.type}
          id={field.campoApi}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min={0}
        />
      )}
      {field.type === "text" &&
        field.mask &&
        getMaskPattern(field.mask, field) === "currency" &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
          <CurrencyInput
            value={value}
            onChange={setValue}
            currency={field.mask as "BRL" | "USD"}
            id={field.campoApi}
            placeholder={field.placeholder}
          />
        )}

      {field.type === "text" &&
        field.mask &&
        getMaskPattern(field.mask, field) !== "currency" &&
        getMaskPattern(field.mask, field) !== undefined &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
          <MaskedInput
            value={value}
            onChange={setValue}
            mask={getMaskPattern(field.mask)!}
            id={field.campoApi}
            placeholder={field.placeholder}
          />
        )}

      {field.type === "text" &&
        (!field.mask || getMaskPattern(field.mask) === undefined) &&
        (!field.qtdRespostas || field.qtdRespostas <= 1) && (
          <Input
            type="text"
            id={field.campoApi}
            maxLength={field.tamanho ? parseInt(field.tamanho) : 999}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.placeholder}
            disabled={!!field.desabilitar}
          />
        )}

      {/* Campo de múltiplas respostas */}
      {field.type !== "tabela" && field.qtdRespostas && field.qtdRespostas > 1 && (
        <MultipleResponsesField
          field={field}
          onValueChange={setValue}
          restFields={restFields}
        />
      )}

      {field.type === "tabela" && (
        <TableField field={field} onValueChange={setValue} restFields={restFields} />
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
    </div>
  );
}
