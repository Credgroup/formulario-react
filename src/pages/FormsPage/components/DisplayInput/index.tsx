import type { FieldType } from "@/types";
import { Label } from "@radix-ui/react-label";

type DisplayInputProps = {
  field: Partial<FieldType>;
};
export default function DisplayInput({ field }: Readonly<DisplayInputProps>) {
  return (
    <Label>
      <div className="flex flex-col gap-1">
        <div>
          <span className="text-sm font-semibold text-zinc-500">
            {field.nome}
          </span>
          {field.obrigatorio && (
            <span className="text-red-500 text-lg ml-1">*</span>
          )}
        </div>
        <span className="font-semibold text-zinc-900">
          {field.conteudo ?? "--"}
        </span>
      </div>
    </Label>
  );
}
