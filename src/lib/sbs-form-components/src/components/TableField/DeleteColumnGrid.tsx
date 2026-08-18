import { v4 } from "uuid";
import { Button } from "../ui/button";
import { LucideTrash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface ColumnGridProps {
  nome: string;
  totalRows: number;
  onDeleteRow?: (rowIndex: number) => void;
}

export default function DeleteColumnGrid({ nome, totalRows, onDeleteRow }: Readonly<ColumnGridProps>) {

  return (
    <div className="flex flex-col border-l first:border-l-0">
      <Tooltip>
        <TooltipTrigger asChild>  
          <div className={`font-semibold border-b px-2 py-2 text-center sticky top-0 z-10 text-sm bg-muted/50 truncate`}>
            {nome}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px]">
          <span className="w-full text-center flex justify-center items-center">
            {nome}
          </span>
        </TooltipContent>
      </Tooltip>
      {Array.from({ length: totalRows }).map((_, idx) => (
        <div key={v4()} className="relative group w-full">
            <div className="px-2 py-2 h-12 border-b last:border-b-0 flex items-center justify-between text-sm line-clamp-2 overflow-hidden text-ellipsis transition-colors cursor-default">
                <span className="break-words whitespace-pre-line text-sm">
                    <Button
                        variant="destructive"
                        size="icon"
                        className="w-8 h-8 cursor-pointer"
                        onClick={() => onDeleteRow?.(idx)}
                    >
                    <LucideTrash/>
                  </Button>
                </span>
            </div>
        </div>
      ))}
    </div>
  );
} 