import { useState } from "react";
import { format, useMask } from "@react-input/mask";
import { Input } from "@/components/ui/input";

type MaskedInputProps = {
  mask: string;
  value: string;
  onChange: (val: string) => void;
  id?: string;
  placeholder?: string;
};

export const MaskedInput: React.FC<MaskedInputProps> = ({
  mask,
  value,
  onChange,
  id,
  placeholder,
}) => {
  const options = {
    mask,
    replacement: {
      a: /[a-zA-Z]/,
      "*": /[a-zA-Z0-9]/,
      _: /./,
    },
    showMask: false,
  };
  const [defaultValue] = useState(format(value ?? "", options));
  const inputRef = useMask(options);

  return (
    <Input
      ref={inputRef}
      id={id}
      defaultValue={defaultValue}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
    />
  );
};

export default MaskedInput;
