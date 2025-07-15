import { v4 } from "uuid";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import GenericField from "../GenericField";
import { LucideCopy, LucideEdit2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColumnGridProps {
  nome: string;
  rows: string[];
  colunaField?: any; // FieldType da coluna, se disponível
  onEditCell?: (newValue: string, rowIndex: number) => void;
}

export default function ColumnGrid({ nome, rows, colunaField, onEditCell }: Readonly<ColumnGridProps>) {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [openEdit, setOpenEdit] = useState(false);

  // Função para copiar texto
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Abrir modal de edição
  const handleEdit = (idx: number, value: string) => {
    setEditIndex(idx);
    setEditValue(value);
    setOpenEdit(true);
  };

  // Salvar edição
  const handleSave = () => {
    if (onEditCell && editIndex !== null) {
      onEditCell(editValue, editIndex);
    }
    setEditIndex(null);
    setEditValue("");
    setOpenEdit(false);
  };

  return (
    <div className="flex flex-col flex-1 min-w-[160px] border-l first:border-l-0">
        
      <Tooltip>
        <TooltipTrigger asChild>  
          <div className="font-semibold border-b px-2 py-2 text-center sticky top-0 z-10 text-sm bg-muted/50 truncate ">
            {nome}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px]">
          <span className="w-full text-center flex justify-center items-center">{nome}</span>
        </TooltipContent>
      </Tooltip>
      {rows.map((linha, idx) => (
        <div key={v4()} className="relative group w-full">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div
                className="px-2 py-2 h-12 border-b last:border-b-0 flex items-center justify-between text-sm cursor-pointer line-clamp-2 overflow-hidden text-ellipsis hover:bg-zinc-100 transition-colors"
              >
                <span className="truncate w-full block">{linha}</span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="flex flex-col gap-2 max-w-xs">
              <span className="break-words whitespace-pre-line text-sm">{linha}</span>
              <div className="flex gap-2 justify-end">
                {colunaField && onEditCell && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8 cursor-pointer"
                        onClick={e => { e.stopPropagation(); handleEdit(idx, linha); }}
                      >
                        <LucideEdit2/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Editar</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 cursor-pointer"
                      onClick={() => handleCopy(linha)}
                    >
                      <LucideCopy/>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copiar</TooltipContent>
                </Tooltip>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      ))}
      {/* Modal de edição de célula, fora do loop */}
      <Dialog open={openEdit} onOpenChange={(state) => {
        if(!state){
          setEditIndex(null);
        }
        setOpenEdit(state);
      }}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Editar célula</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            {colunaField ? (
              <GenericField
                field={{ ...colunaField, conteudo: editValue }}
                onValueChange={setEditValue}
                restFields={[]}
              />
            ) : (
              <input
                className="w-full border rounded px-2 py-1"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setEditIndex(null)}>
                Cancelar
              </Button>
            </DialogClose>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 