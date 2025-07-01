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
}

export default function TableGridContainer({ colunas }: Readonly<TableGridContainerProps>) {
  return (
    <div className="relative flex w-full border rounded">
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
  );
} 