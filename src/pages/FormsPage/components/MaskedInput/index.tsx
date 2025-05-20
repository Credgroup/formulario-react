// components/MaskedInput.tsx
import React from "react";
import { useMask } from "@react-input/mask";
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
  const inputRef = useMask({
    mask,
    replacement: {
      "9": /\d/,
      a: /[a-zA-Z]/,
      "*": /[a-zA-Z0-9]/,
    },
    // Manter valor completo e formatado
    showMask: false,
  });

  return (
    <Input
      ref={inputRef}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
};

export default MaskedInput;
