import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { FieldType, TpOptions } from "@/types";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useEffect, useState } from "react";
import { formatOptions } from "../GenericField";
import { dev_log } from "@/lib/utils";

type ComboCheckboxProps = {
  field: Partial<FieldType>;
  onValueChange: (value: string) => void;
};
export default function ComboCheckbox({
  field,
  onValueChange,
}: Readonly<ComboCheckboxProps>) {
  const [options, setOptions] = useState<TpOptions[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  useEffect(() => {
    if (!Array.isArray(field.options)) {
      dev_log(() => console.log("field", field));
      const opt = formatOptions(field.options ?? "");
      setOptions(opt);
    }
  }, []);

  useEffect(() => {
    if (selectedValues.length !== 0) {
      onValueChange(selectedValues.join(";"));
    } else {
      onValueChange("");
    }
  }, [selectedValues]);

  const handleAddRemoveOption = (option: string, checked: CheckedState) => {
    if (checked) {
      setSelectedValues((prev) => [...prev, option]);
    } else {
      setSelectedValues((prev) => prev.filter((opt) => opt !== option));
    }
  };

  return (
    <div className="flex items-center justify-start gap-3 w-full min-h-10">
      {options.map((option) => (
        <Label
          htmlFor={`${field.campoApi}-${option.label}`}
          key={`${field.campoApi}-${option.label}`}
          className="cursor-pointer"
        >
          <Checkbox
            id={`${field.campoApi}-${option.label}`}
            onCheckedChange={(checked) =>
              handleAddRemoveOption(option.value, checked)
            }
          />
          {option.label}
        </Label>
      ))}
    </div>
  );
}
