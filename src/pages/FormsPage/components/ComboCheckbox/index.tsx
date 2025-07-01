import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { FieldType, TpOptions } from "@/types";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useEffect, useState, useRef } from "react";
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
  const isInitialized = useRef(false);
  const lastConteudo = useRef<string>("");

  useEffect(() => {
    if (!Array.isArray(field.options)) {
      dev_log(() => console.log("field", field));
      const opt = formatOptions(field.options ?? "");
      setOptions(opt);
    }
  }, [field]);

  useEffect(() => {
    if (field.conteudo && field.conteudo.trim() !== "") {
      const existingValues = field.conteudo.split(";").filter((val: string) => val.trim() !== "");
      if (lastConteudo.current !== field.conteudo) {
        setSelectedValues(existingValues);
        lastConteudo.current = field.conteudo;
      }
    } else if (!isInitialized.current) {
      setSelectedValues([]);
      lastConteudo.current = "";
    }
    isInitialized.current = true;
  }, [field.conteudo, field.campoApi]);

  useEffect(() => {
    if (isInitialized.current) {
      const newValue = selectedValues.length !== 0 ? selectedValues.join(";") : "";
      if (lastConteudo.current !== newValue) {
        onValueChange(newValue);
        lastConteudo.current = newValue;
      }
    }
  }, [selectedValues, onValueChange]);

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
            checked={selectedValues.includes(option.value)}
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
