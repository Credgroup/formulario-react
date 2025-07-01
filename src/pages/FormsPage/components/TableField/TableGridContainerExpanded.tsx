import ColumnGrid from "./ColumnGrid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useEffect } from "react";

interface TableGridContainerExpandedProps {
  colunas: Array<{
    nmColumn: string;
    id: string;
    namedTo: string;
    rows: string[];
    colunaField?: any;
    onEditCell?: (newValue: string, rowIndex: number) => void;
  }>;
  onBack: () => void;
}

export default function TableGridContainerExpanded({ colunas, onBack }: Readonly<TableGridContainerExpandedProps>) {
  useEffect(()=>{
    console.log(colunas)
  }, [])
  return (
    <Dialog open onOpenChange={onBack}>
      <DialogContent className="!min-w-[90vw] !h-[90vh] max-w-none p-0 flex flex-col">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <DialogTitle className="font-bold text-lg">Tabela Completa</DialogTitle>
          <Button variant="outline" onClick={onBack}>Voltar</Button>
        </DialogHeader>
        <div className="flex-1 overflow-auto px-2">
          <div className="flex w-fit min-w-full border">
            {colunas.map((col) => (
              <ColumnGrid
                key={col.id}
                nome={col.nmColumn}
                rows={col.rows}
                colunaField={col.colunaField}
                onEditCell={col.onEditCell}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 