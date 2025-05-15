import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldType } from "@/types";

type GenericFieldProps = {
  field: Partial<FieldType>;
};
export default function GenericField({ field }: Readonly<GenericFieldProps>) {
  return (
    <div className="flex flex-col items-start gap-y-2 justify-center">
      <Label htmlFor={field.campoApi} className="leading-6 w-full">
        {field.nome}
      </Label>
      <Input type={field.type} id={field.campoApi} />
    </div>
  );
}
