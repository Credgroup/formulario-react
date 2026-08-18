import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Plus, Save, Trash2 } from "lucide-react";
import type { FieldType } from "../../core/types";
import { ScrollArea } from "../ui/scroll-area";
import GenericField from "../GenericField";
import { v4 } from "uuid";

interface MultipleResponsesFieldProps {
  field: Partial<FieldType>;
  onValueChange: (value: string) => void;
  restFields?: Partial<FieldType>[];
}

export function MultipleResponsesField({ field, onValueChange, restFields }: Readonly<MultipleResponsesFieldProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldInputs, setFieldInputs] = useState<Partial<FieldType>[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number>(-1);
  const [displayValue, setDisplayValue] = useState<string>(field.placeholder ?? "");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
  const lastConteudo = useRef<string>("");
  const isInitialized = useRef(false);

  // Função para criar um campo semelhante ao pai
  const createFieldFromParent = (index: number): Partial<FieldType> => {
    return {
      ...field,
      qtdRespostas: undefined, // Remove qtdRespostas para evitar recursão
      campoApi: `${field.campoApi}_${v4()}`,
      nome: `Resposta nº${index + 1}`,
      conteudo: "",
    };
  };

  // Inicializar com valores existentes
  useEffect(() => {
    // Só processar se o conteúdo realmente mudou
    if (lastConteudo.current === field.conteudo && isInitialized.current) {
      return;
    }

    if (field.conteudo) {
      try {
        const parsedFields = JSON.parse(field.conteudo);
        if (Array.isArray(parsedFields) && parsedFields.length > 0) {
          setFieldInputs(parsedFields);
          // Criar display value baseado nos conteúdos dos campos
          const contents = parsedFields.map(f => {
            if (f.type === "combo_checkbox" && f.conteudo) {
              // Para combo_checkbox, mostrar os valores selecionados de forma mais legível
              const selectedValues = f.conteudo.split(";").filter((val: string) => val.trim() !== "");
              return selectedValues.join(", ");
            }
            return f.conteudo || "";
          }).filter(c => c.trim() !== "");
          setDisplayValue(contents.join(", "));
        } else {
          // Se não há campos válidos, criar um campo inicial
          setFieldInputs([createFieldFromParent(0)]);
          setDisplayValue(field.placeholder ?? "");
        }
      } catch (error) {
        console.error("Erro ao analisar JSON:", error);
        // Se há erro no JSON, criar um campo inicial
        setFieldInputs([createFieldFromParent(0)]);
        setDisplayValue(field.placeholder ?? "");
      }
    } else {
      // Se não há conteúdo, criar um campo inicial
      setFieldInputs([createFieldFromParent(0)]);
      setDisplayValue(field.placeholder ?? "");
    }
    
    lastConteudo.current = field.conteudo || "";
    isInitialized.current = true;
  }, [field.conteudo]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  };

  useEffect(() => {
    if (shouldScrollToBottom) {
      setTimeout(() => {
        scrollToBottom();
        setShouldScrollToBottom(false);
      }, 100);
    }
  }, [fieldInputs, shouldScrollToBottom]);

  useEffect(()=>{
    console.log(field)
  },[])

  const addResponse = () => {
    // Verifica se o número máximo de respostas foi atingido
    if(fieldInputs.length >= field.qtdRespostas!){
      // toast.error(`Você pode adicionar no máximo ${field.qtdRespostas} respostas.`);
      return;
    }

    // Verifica se o último campo está preenchido antes de adicionar um novo
    if(field.type === "calculado"){
      return
    }
    const lastField = fieldInputs[fieldInputs.length - 1];
    
    // Para campos combo_checkbox, verificar se há valores selecionados
    if (lastField.type === "combo_checkbox") {
      const hasSelectedValues = lastField.conteudo && lastField.conteudo.trim() !== "" && lastField.conteudo.split(";").some((val: string) => val.trim() !== "");
      if (hasSelectedValues) {
        const newField = createFieldFromParent(fieldInputs.length);
        setFieldInputs([...fieldInputs, newField]);
        setShouldScrollToBottom(true);
      } else {
        // toast.error("Selecione pelo menos uma opção antes de adicionar outro campo");
      }
    } else {
      // Para outros tipos de campo, manter a validação original
      if (lastField && lastField.conteudo && lastField.conteudo.trim() !== "") {
        const newField = createFieldFromParent(fieldInputs.length);
        setFieldInputs([...fieldInputs, newField]);
        setShouldScrollToBottom(true);
      } else {
        // toast.error("Preencha o campo atual antes de adicionar outro");
      }
    }
  };

  const removeResponse = (index: number) => {
    if (fieldInputs.length > 1) {
      setDeleteIndex(index);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    const newFields = fieldInputs.filter((_, index) => index !== deleteIndex);
    setFieldInputs(newFields);
    setShowDeleteConfirm(false);
    setDeleteIndex(-1);
  };

  const handleSave = () => {
    const validFields = fieldInputs.filter(f => {
      if (f.type === "combo_checkbox") {
        // Para combo_checkbox, verificar se há valores selecionados
        return f.conteudo && f.conteudo.trim() !== "" && f.conteudo.split(";").some((val: string) => val.trim() !== "");
      }
      // Para outros tipos, manter a validação original
      return f.conteudo && f.conteudo.trim() !== "";
    });
    
    if (validFields.length === 0) {
      // toast.error("Adicione pelo menos uma resposta");
      return;
    }
    setShowSaveConfirm(true);
    console.log(fieldInputs)
  };

  const confirmSave = () => {
    const validFields = fieldInputs.filter(f => {
      if (f.type === "combo_checkbox") {
        // Para combo_checkbox, verificar se há valores selecionados
        return f.conteudo && f.conteudo.trim() !== "" && f.conteudo.split(";").some((val: string) => val.trim() !== "");
      }
      // Para outros tipos, manter a validação original
      return f.conteudo && f.conteudo.trim() !== "";
    });
    
    const jsonValue = JSON.stringify(validFields);
    onValueChange(jsonValue);
    
    // Atualizar display value
    const contents = validFields.map(f => {
      if (f.type === "combo_checkbox" && f.conteudo) {
        // Para combo_checkbox, mostrar os valores selecionados de forma mais legível
        const selectedValues = f.conteudo.split(";").filter((val: string) => val.trim() !== "");
        return selectedValues.join(", ");
      }
      return f.conteudo ?? "";
    }).filter(c => c.trim() !== "");
    
    setDisplayValue(contents.join(", "));
    
    console.log(jsonValue)
    console.log(validFields)
    setIsOpen(false);
    setShowSaveConfirm(false);
    // toast.success("Respostas salvas com sucesso!");
  };

  const handleClose = () => {
    if (field.conteudo) {
      try {
        const parsedFields = JSON.parse(field.conteudo);
        if (Array.isArray(parsedFields) && parsedFields.length > 0) {
          setFieldInputs(parsedFields);
        } else {
          setFieldInputs([createFieldFromParent(0)]);
        }
      } catch {
        setFieldInputs([createFieldFromParent(0)]);
      }
    } else {
      setFieldInputs([createFieldFromParent(0)]);
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <span className="text-sm text-muted-foreground truncate">
              {displayValue}
            </span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{field.nome}</DialogTitle>
            <DialogDescription>
              {field.dsSubtitulo ?? "Adicione múltiplas respostas para este campo"}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[400px] scrollbar-none" ref={scrollAreaRef}>
            <div className="w-full h-fit flex flex-col gap-4 p-1">
            {fieldInputs.map((fieldInput, index) => (
              <div key={fieldInput.campoApi ?? `field-${index}`} className="flex items-end gap-2">
                <div className="flex-1">
                  <GenericField 
                    field={fieldInput} 
                    restFields={restFields ?? []} 
                  />
                </div>
                {fieldInputs.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeResponse(index)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            </div>
          </ScrollArea>
            <Button
              type="button"
              variant="outline"
              onClick={addResponse}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar resposta
            </Button>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta resposta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
              </DialogClose>
            <Button onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de salvamento */}
      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar salvamento</DialogTitle>
            <DialogDescription>
              Confirme as respostas que serão salvas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="space-y-1">
              {fieldInputs
                .filter(fieldInput => fieldInput.conteudo && fieldInput.conteudo.trim() !== "")
                .map((fieldInput) => (
                  <Badge key={v4()} variant="secondary" className="mr-1">
                    {fieldInput.conteudo}
                  </Badge>
                ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={confirmSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 