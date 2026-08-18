import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import type { FieldType } from "../../core/types";
import GenericField from "../GenericField";

type CondicionalFieldProps = {
  field: Partial<FieldType>;
  restFields: Partial<FieldType>[];
  onValueChange?: (value: any) => void;
};

type ConditionalValue = {
  campoApi: string;
  conteudo: string;
};

export function CondicionalField({
  field,
  restFields,
  onValueChange,
}: Readonly<CondicionalFieldProps>) {
  const [isChecked, setIsChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conditionalValues, setConditionalValues] = useState<ConditionalValue[]>([]);
  const [displayValue, setDisplayValue] = useState<string>("Preencher informações");

  // Parse do conteúdo existente ao inicializar
  useEffect(() => {
    if (field.conteudo) {
      try {
        const parsed = JSON.parse(field.conteudo);
        if (Array.isArray(parsed)) {
          setConditionalValues(parsed);
          setIsChecked(true);
          updateDisplayValue(parsed);
        }
      } catch (error) {
        console.error("Erro ao fazer parse do conteúdo condicional:", error);
      }
    }
  }, [field.conteudo]);

  // Atualiza o valor do campo principal quando o checkbox muda
  useEffect(() => {
    if (!isChecked) {
      field.conteudo = "";
      setConditionalValues([]);
      setDisplayValue("Preencher informações");
    }
    onValueChange?.(field.conteudo);
  }, [isChecked]);

  // Função para encontrar valor de um campo específico
  const findConditionalValue = (campoApi: string): string => {
    const found = conditionalValues.find(item => item.campoApi === campoApi);
    return found?.conteudo || "";
  };

  // Função para atualizar valor de um campo específico
  const updateConditionalValue = (campoApi: string, conteudo: string) => {
    setConditionalValues(prev => {
      const existing = prev.find(item => item.campoApi === campoApi);
      if (existing) {
        return prev.map(item => 
          item.campoApi === campoApi ? { ...item, conteudo } : item
        );
      } else {
        return [...prev, { campoApi, conteudo }];
      }
    });
  };

  // Função para atualizar o texto de exibição do botão
  const updateDisplayValue = (values: ConditionalValue[]) => {
    if (values.length === 0) {
      setDisplayValue("Preencher informações");
      return;
    }

    const filledValues = values.filter(v => v.conteudo && v.conteudo.trim() !== "");
    if (filledValues.length === 0) {
      setDisplayValue("Preencher informações");
      return;
    }

    if (filledValues.length === 1) {
      setDisplayValue(filledValues[0].conteudo);
    } else {
      setDisplayValue(`${filledValues.length} campos preenchidos`);
    }
  };

  // Handler para mudança do checkbox
  const handleCheckboxChange = (checked: boolean) => {
    setIsChecked(checked);
  };

  // Handler para abrir o modal
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  // Handler para fechar o modal
//   const handleModalClose = () => {
//     setIsModalOpen(false);
//   };

  // Handler para mudança de campo condicional
  const handleConditionalFieldChange = (campoApi: string, value: string) => {
    updateConditionalValue(campoApi, value);
  };

  // Handler para salvar os valores
  const handleSave = () => {
    // Validar campos obrigatórios
    const requiredFields = field.camposCondicionais?.filter(f => f.obrigatorio) || [];
    const missingFields = requiredFields.filter(f => {
      const value = findConditionalValue(f.campoApi || "");
      return !value || value.trim() === "";
    });

    if (missingFields.length > 0) {
      // toast.error(`Preencha os campos obrigatórios: ${missingFields.map(f => f.nome).join(", ")}`);
      return;
    }

    // Salvar no campo principal
    const jsonContent = JSON.stringify(conditionalValues);
    field.conteudo = jsonContent;
    onValueChange?.(jsonContent);
    
    // Atualizar display value
    updateDisplayValue(conditionalValues);
    
    // Fechar modal
    setIsModalOpen(false);
    
    // toast.success("Informações salvas com sucesso!");
  };

  // Handler para cancelar
  const handleCancel = () => {
    // Restaurar valores originais se existirem
    if (field.conteudo) {
      try {
        const parsed = JSON.parse(field.conteudo);
        if (Array.isArray(parsed)) {
          setConditionalValues(parsed);
          updateDisplayValue(parsed);
        }
      } catch (error) {
        setConditionalValues([]);
        setDisplayValue("Preencher informações");
      }
    } else {
      setConditionalValues([]);
      setDisplayValue("Preencher informações");
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-start gap-y-4 justify-start w-full">
      {/* Checkbox principal */}
      <div className="flex items-center justify-start gap-3 w-full">
        <Label
          htmlFor={field.campoApi}
          className="leading-6 w-full cursor-pointer"
        >
          <Checkbox
            id={field.campoApi}
            onCheckedChange={handleCheckboxChange}
            className="w-5 h-5"
            checked={isChecked}
          />
          {field.nome}
          {field.obrigatorio && (
            <span className="relative text-red-500 text-lg -left-1">*</span>
          )}
        </Label>
      </div>

      {/* Botão do modal (só aparece quando checkbox está marcado) */}
      {isChecked && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start text-left font-normal cursor-pointer"
              onClick={handleModalOpen}
            >
              <span className="text-sm text-muted-foreground truncate">
                {displayValue}
              </span>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{field.nome}</DialogTitle>
              <DialogDescription>
                Preencha as informações solicitadas
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="max-h-[400px]">
              <div className="flex flex-col gap-4 p-2">
                {field.camposCondicionais?.map((conditionalField, index) => (
                  <GenericField
                    key={conditionalField.campoApi || index}
                    field={{
                      ...conditionalField,
                      conteudo: findConditionalValue(conditionalField.campoApi || "")
                    }}
                    restFields={restFields}
                    onValueChange={(value) => 
                      handleConditionalFieldChange(conditionalField.campoApi || "", value)
                    }
                  />
                ))}
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 