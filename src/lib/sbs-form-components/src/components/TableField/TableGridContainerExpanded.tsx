import ColumnGrid from "./ColumnGrid";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";
import DeleteColumnGrid from "./DeleteColumnGrid";

type Coluna = {
  id: string;
  nmColumn: string;
  namedTo: string;
  rows: string[];
  colunaField?: any;
  onEditCell?: (newValue: string, rowIndex: number) => void;
}

interface TableGridContainerExpandedProps {
  colunas: Coluna[];
  onBack: () => void;
  onEditColumns?: (json: string) => void
}

export default function TableGridContainerExpanded({ colunas, onBack, onEditColumns }: Readonly<TableGridContainerExpandedProps>) {
  
  const handleDeleteRow = (rowIndex: number) => {
    const colunasAtualizadas = colunas.map((col: any) => {
      const novasRows = [...col.rows];
      novasRows.splice(rowIndex, 1);
      return { ...col, rows: novasRows };
    });
    const json = JSON.stringify(colunasAtualizadas, null, 2)
    onEditColumns?.(json);
  };

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
            {
              colunas.length > 0 && colunas[0].rows.length > 0 && (
                <DeleteColumnGrid
                  key="delete-row-column"
                  nome="Excluir"
                  totalRows={colunas[0].rows.length}
                  onDeleteRow={(rowIndex) => handleDeleteRow(rowIndex)}
                />
              )
            }
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 