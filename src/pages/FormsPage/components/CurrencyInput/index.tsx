import { NumericFormat } from "react-number-format";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  value: string;
  onChange: (val: string) => void;
  currency: "BRL" | "USD";
  id?: string;
  placeholder?: string;
}

export const CurrencyInput = ({
  value,
  onChange,
  currency,
  id,
  placeholder,
}: CurrencyInputProps) => {
  const isBRL = currency === "BRL";

  return (
    <NumericFormat
      id={id}
      placeholder={placeholder}
      customInput={Input}
      value={value}
      onValueChange={(values) => {
        onChange(values.value);
      }}
      thousandSeparator={isBRL ? "." : ","}
      decimalSeparator={isBRL ? "," : "."}
      prefix={isBRL ? "R$ " : "US$ "}
      decimalScale={2}
      allowNegative={false}
    />
  );
};
