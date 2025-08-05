import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { 
  applyMask,
  removeMask, 
  MASK_CONFIGS,
  getCleanUsdValue,
  getCleanBrlValue,
  getCleanPorcentagemValue,
  type MaskType
} from "./maskUtils";

type MaskedInputProps = {
  mask: MaskType;
  value: string;
  onChange: (val: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export const MaskedInput: React.FC<MaskedInputProps> = ({
  mask,
  value,
  onChange,
  id,
  placeholder,
  className,
  disabled = false,
}) => {
  // Estado interno para controlar o valor exibido com máscara
  const [displayValue, setDisplayValue] = useState("");
  
  // Configuração da máscara atual
  const maskConfig = MASK_CONFIGS[mask];

  // Efeito para sincronizar o valor externo com o display interno
  useEffect(() => {
    if (value) {
      // Se o valor já tem máscara, remove e aplica novamente
      const cleanValue = removeMask(value);
      const maskedValue = applyMask(cleanValue, mask);
      setDisplayValue(maskedValue);
    } else {
      setDisplayValue("");
    }
  }, [value, mask]);

  // Função para lidar com mudanças no input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove qualquer máscara existente do valor digitado
    const cleanInputValue = removeMask(inputValue);
    
    // Aplica a máscara correta
    const maskedValue = applyMask(cleanInputValue, mask);
    
    // Atualiza o display
    setDisplayValue(maskedValue);
    
    // Chama o onChange com o valor limpo apropriado para cada tipo
    let cleanValue = cleanInputValue;
    if (mask === "usd") {
      cleanValue = getCleanUsdValue(cleanInputValue);
    } else if (mask === "brl") {
      cleanValue = getCleanBrlValue(cleanInputValue);
    } else if (mask === "porcentagem") {
      cleanValue = getCleanPorcentagemValue(cleanInputValue);
    }
    
    onChange(cleanValue);
  };

  // Função para lidar com colagem (paste)
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    // Obtém o texto colado
    const pastedText = e.clipboardData.getData('text');
    
    // Remove qualquer máscara do texto colado
    const cleanPastedValue = removeMask(pastedText);
    
    // Aplica a máscara correta
    const maskedValue = applyMask(cleanPastedValue, mask);
    
    // Atualiza o display
    setDisplayValue(maskedValue);
    
    // Chama o onChange com o valor limpo apropriado para cada tipo
    let cleanValue = cleanPastedValue;
    if (mask === "usd") {
      cleanValue = getCleanUsdValue(cleanPastedValue);
    } else if (mask === "brl") {
      cleanValue = getCleanBrlValue(cleanPastedValue);
    } else if (mask === "porcentagem") {
      cleanValue = getCleanPorcentagemValue(cleanPastedValue);
    }
    
    onChange(cleanValue);
  };

  return (
    <Input
      id={id}
      value={displayValue}
      onChange={handleChange}
      onPaste={handlePaste}
      placeholder={placeholder || maskConfig.placeholder}
      className={className}
      disabled={disabled}
      autoComplete="off"
      maxLength={maskConfig.maxLength}
    />
  );
};

export default MaskedInput; 