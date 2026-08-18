import ColumnGrid from "./ColumnGrid";

interface TableGridContainerProps {
  colunas: Array<{
    id: string;
    nmColumn: string;
    namedTo: string;
    rows: string[];
    colunaField?: any;
    onEditCell?: (newValue: string, rowIndex: number) => void;
  }>;
  readOnly?: boolean;
}

export default function TableGridContainer({ colunas, readOnly = false }: Readonly<TableGridContainerProps>) {
  return (
    <div className="relative flex w-full border rounded">
      {colunas.map((col) => (
        <ColumnGrid
          key={col.id}
          nome={col.nmColumn}
          rows={col.rows}
          colunaField={col.colunaField}
          onEditCell={readOnly ? undefined : col.onEditCell}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
} 