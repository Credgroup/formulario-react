// Tipos de máscara disponíveis
export const MASK_TYPES = ["cpf", "cnpj", "telefone", "telefone_simples", "celular", "celular_simples", "telefone_ddd", "celular_ddd", "rg", "cep", "data", "hora", "data_hora", "placa", "cartao_credito", "pix", "usd", "brl", "porcentagem", "numero_inteiro", "numero_decimal"];
export type MaskType = 
  | "cpf" 
  | "cnpj" 
  | "telefone" 
  | "telefone_simples"
  | "celular" 
  | "celular_simples"
  | "telefone_ddd" 
  | "celular_ddd"
  | "rg" 
  | "cep" 
  | "data"
  | "hora"
  | "data_hora"
  | "placa"
  | "cartao_credito"
  | "pix"
  | "usd"
  | "brl"
  | "porcentagem"
  | "numero_inteiro"
  | "numero_decimal";

// Configurações das máscaras
export const MASK_CONFIGS = {
  cpf: {
    pattern: "___.___.___-__",
    maxLength: 14,
    placeholder: "000.000.000-00"
  },
  cnpj: {
    pattern: "__.___.___/____-__",
    maxLength: 18,
    placeholder: "00.000.000/0000-00"
  },
  telefone: {
    pattern: "(__) _____-____",
    maxLength: 15,
    placeholder: "(00) 00000-0000"
  },
  telefone_simples: {
    pattern: "____-____",
    maxLength: 9,
    placeholder: "0000-0000"
  },
  celular: {
    pattern: "(__) _____-____",
    maxLength: 15,
    placeholder: "(00) 00000-0000"
  },
  celular_simples: {
    pattern: "_ ____-____",
    maxLength: 10,
    placeholder: "0 0000-0000"
  },
  telefone_ddd: {
    pattern: "(__) ____-____",
    maxLength: 14,
    placeholder: "(00) 0000-0000"
  },
  celular_ddd: {
    pattern: "(__) _____-____",
    maxLength: 15,
    placeholder: "(00) 00000-0000"
  },
  rg: {
    pattern: "__.___.___-__",
    maxLength: 12,
    placeholder: "00.000.000-0"
  },
  cep: {
    pattern: "_____-___",
    maxLength: 9,
    placeholder: "00000-000"
  },
  data: {
    pattern: "__/__/____",
    maxLength: 10,
    placeholder: "00/00/0000"
  },
  hora: {
    pattern: "__:__",
    maxLength: 5,
    placeholder: "00:00"
  },
  data_hora: {
    pattern: "__/__/____ __:__",
    maxLength: 16,
    placeholder: "00/00/0000 00:00"
  },
  placa: {
    pattern: "___-____",
    maxLength: 8,
    placeholder: "ABC-1234"
  },
  cartao_credito: {
    pattern: "____ ____ ____ ____",
    maxLength: 19,
    placeholder: "0000 0000 0000 0000"
  },
  pix: {
    pattern: "____.____.____.____",
    maxLength: 19,
    placeholder: "0000.0000.0000.0000"
  },
  usd: {
    pattern: "$ __.___,__",
    maxLength: 999999, // Limite muito alto para permitir trilhões
    placeholder: "$ 0.00"
  },
  brl: {
    pattern: "R$ __.___,__",
    maxLength: 999999, // Limite muito alto para permitir trilhões
    placeholder: "R$ 0,00"
  },
  porcentagem: {
    pattern: "___,__%",
    maxLength: 999999, // Limite muito alto para permitir trilhões
    placeholder: "0,00%"
  },
  numero_inteiro: {
    pattern: "_____",
    maxLength: 999999, // Limite muito alto para permitir trilhões
    placeholder: "00000"
  },
  numero_decimal: {
    pattern: "___,__",
    maxLength: 999999, // Limite muito alto para permitir trilhões
    placeholder: "0,00"
  }
};

// Função para remover todos os caracteres especiais (máscaras)
export const removeMask = (value: string): string => {
  return value.replace(/[^0-9]/g, "");
};

// Função para remover máscara de texto (letras e números)
export const removeTextMask = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9]/g, "");
};

// Função para aplicar máscara de CPF
export const applyCpfMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 11; i++) {
    if (i === 3 || i === 6) masked += ".";
    if (i === 9) masked += "-";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de CNPJ
export const applyCnpjMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 14; i++) {
    if (i === 2 || i === 5) masked += ".";
    if (i === 8) masked += "/";
    if (i === 12) masked += "-";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de telefone simples (8 dígitos)
export const applyTelefoneSimplesMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 8; i++) {
    if (i === 4) masked += "-";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de celular simples (9 dígitos)
export const applyCelularSimplesMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 9; i++) {
    if (i === 1) masked += " ";
    if (i === 5) masked += "-";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de telefone com DDD (10 dígitos)
export const applyTelefoneDddMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 10; i++) {
    if (i === 0) masked += "(";
    if (i === 2) masked += ") ";
    if (i === 6) masked += "-";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de celular com DDD (11 dígitos)
export const applyCelularDddMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 11; i++) {
    if (i === 0) masked += "(";
    if (i === 2) masked += ") ";
    if (i === 7) masked += "-";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de telefone (detecta automaticamente)
export const applyTelefoneMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  // Se tem 11 dígitos, é celular com DDD
  if (cleanValue.length === 11) {
    return applyCelularDddMask(value);
  }
  // Se tem 10 dígitos, é telefone com DDD
  if (cleanValue.length === 10) {
    return applyTelefoneDddMask(value);
  }
  // Se tem 9 dígitos, é celular simples
  if (cleanValue.length === 9) {
    return applyCelularSimplesMask(value);
  }
  // Se tem 8 dígitos, é telefone simples
  if (cleanValue.length === 8) {
    return applyTelefoneSimplesMask(value);
  }
  
  // Aplica máscara progressiva
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 11; i++) {
    if (i === 0) masked += "(";
    if (i === 2) masked += ") ";
    if (i === 7) masked += "-";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de celular (detecta automaticamente)
export const applyCelularMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  // Se tem 11 dígitos, é celular com DDD
  if (cleanValue.length === 11) {
    return applyCelularDddMask(value);
  }
  // Se tem 9 dígitos, é celular simples
  if (cleanValue.length === 9) {
    return applyCelularSimplesMask(value);
  }
  
  // Aplica máscara progressiva
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 11; i++) {
    if (i === 0) masked += "(";
    if (i === 2) masked += ") ";
    if (i === 7) masked += "-";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de RG
export const applyRgMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 9; i++) {
    if (i === 2 || i === 5) masked += ".";
    if (i === 8) masked += "-";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de CEP
export const applyCepMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 8; i++) {
    if (i === 5) masked += "-";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de data
export const applyDataMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 8; i++) {
    if (i === 2 || i === 4) masked += "/";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de hora
export const applyHoraMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 4; i++) {
    if (i === 2) masked += ":";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de data e hora
export const applyDataHoraMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 12; i++) {
    if (i === 2 || i === 4) masked += "/";
    if (i === 8) masked += " ";
    if (i === 10) masked += ":";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de placa
export const applyPlacaMask = (value: string): string => {
  const cleanValue = removeTextMask(value).toUpperCase();
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 7; i++) {
    if (i === 3) masked += "-";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de cartão de crédito
export const applyCartaoCreditoMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 16; i++) {
    if (i === 4 || i === 8 || i === 12) masked += " ";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de PIX
export const applyPixMask = (value: string): string => {
  const cleanValue = removeTextMask(value).toUpperCase();
  if (cleanValue.length === 0) return "";
  
  let masked = "";
  for (let i = 0; i < cleanValue.length && i < 16; i++) {
    if (i === 4 || i === 8 || i === 12) masked += ".";
    masked += cleanValue[i];
  }
  return masked;
};

// Função para aplicar máscara de USD
export const applyUsdMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  // Usa BigInt para lidar com números muito grandes
  const centavos = BigInt(cleanValue) || BigInt(0);
  const dolares = centavos / BigInt(100);
  const centavosResto = Number(centavos % BigInt(100));
  
  // Formata com separadores de milhares
  const dolaresFormatados = dolares.toLocaleString('en-US');
  
  return `$ ${dolaresFormatados}.${centavosResto.toString().padStart(2, '0')}`;
};

// Função para aplicar máscara de BRL
export const applyBrlMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  // Usa BigInt para lidar com números muito grandes
  const centavos = BigInt(cleanValue) || BigInt(0);
  const reais = centavos / BigInt(100);
  const centavosResto = Number(centavos % BigInt(100));
  
  // Formata com separadores de milhares
  const reaisFormatados = reais.toLocaleString('pt-BR');
  
  return `R$ ${reaisFormatados},${centavosResto.toString().padStart(2, '0')}`;
};

// Função para aplicar máscara de porcentagem
export const applyPorcentagemMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  // Usa BigInt para lidar com números muito grandes
  const numero = BigInt(cleanValue) || BigInt(0);
  const inteiro = numero / BigInt(100);
  const decimal = Number(numero % BigInt(100));
  
  // Formata com separadores de milhares
  const inteiroFormatado = inteiro.toLocaleString('pt-BR');
  
  return `${inteiroFormatado},${decimal.toString().padStart(2, '0')}%`;
};

// Função para aplicar máscara de número inteiro
export const applyNumeroInteiroMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  // Usa BigInt para lidar com números muito grandes
  const numero = BigInt(cleanValue) || BigInt(0);
  return numero.toLocaleString('pt-BR');
};

// Função para aplicar máscara de número decimal
export const applyNumeroDecimalMask = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  // Usa BigInt para lidar com números muito grandes
  const numero = BigInt(cleanValue) || BigInt(0);
  const inteiro = numero / BigInt(100);
  const decimal = Number(numero % BigInt(100));
  
  // Formata com separadores de milhares
  const inteiroFormatado = inteiro.toLocaleString('pt-BR');
  
  return `${inteiroFormatado},${decimal.toString().padStart(2, '0')}`;
};

// Função principal para aplicar máscara baseada no tipo
export const applyMask = (value: string, maskType: MaskType): string => {
  switch (maskType) {
    case "cpf":
      return applyCpfMask(value);
    case "cnpj":
      return applyCnpjMask(value);
    case "telefone":
      return applyTelefoneMask(value);
    case "telefone_simples":
      return applyTelefoneSimplesMask(value);
    case "celular":
      return applyCelularMask(value);
    case "celular_simples":
      return applyCelularSimplesMask(value);
    case "telefone_ddd":
      return applyTelefoneDddMask(value);
    case "celular_ddd":
      return applyCelularDddMask(value);
    case "rg":
      return applyRgMask(value);
    case "cep":
      return applyCepMask(value);
    case "data":
      return applyDataMask(value);
    case "hora":
      return applyHoraMask(value);
    case "data_hora":
      return applyDataHoraMask(value);
    case "placa":
      return applyPlacaMask(value);
    case "cartao_credito":
      return applyCartaoCreditoMask(value);
    case "pix":
      return applyPixMask(value);
    case "usd":
      return applyUsdMask(value);
    case "brl":
      return applyBrlMask(value);
    case "porcentagem":
      return applyPorcentagemMask(value);
    case "numero_inteiro":
      return applyNumeroInteiroMask(value);
    case "numero_decimal":
      return applyNumeroDecimalMask(value);
    default:
      return value;
  }
};

// Função para obter o valor limpo (sem máscara) para salvar
export const getCleanValue = (value: string): string => {
  return removeMask(value);
};

// Função para obter o valor limpo de texto (letras e números)
export const getCleanTextValue = (value: string): string => {
  return removeTextMask(value);
};

// Função para obter o valor limpo de USD (formato: "12.34")
export const getCleanUsdValue = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  // Usa BigInt para lidar com números muito grandes
  const centavos = BigInt(cleanValue) || BigInt(0);
  const dolares = centavos / BigInt(100);
  const centavosResto = Number(centavos % BigInt(100));
  
  return `${dolares}.${centavosResto.toString().padStart(2, '0')}`;
};

// Função para obter o valor limpo de BRL (formato: "12,34")
export const getCleanBrlValue = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  // Usa BigInt para lidar com números muito grandes
  const centavos = BigInt(cleanValue) || BigInt(0);
  const reais = centavos / BigInt(100);
  const centavosResto = Number(centavos % BigInt(100));
  
  return `${reais},${centavosResto.toString().padStart(2, '0')}`;
};

// Função para obter o valor limpo de porcentagem (formato: "12,34")
export const getCleanPorcentagemValue = (value: string): string => {
  const cleanValue = removeMask(value);
  if (cleanValue.length === 0) return "";
  
  // Usa BigInt para lidar com números muito grandes
  const numero = BigInt(cleanValue) || BigInt(0);
  const inteiro = numero / BigInt(100);
  const decimal = Number(numero % BigInt(100));
  
  return `${inteiro},${decimal.toString().padStart(2, '0')}`;
};

// Função para validar se o valor está completo
export const isComplete = (value: string, maskType: MaskType): boolean => {
  const cleanValue = removeMask(value);
  
  switch (maskType) {
    case "cpf":
      return cleanValue.length === 11;
    case "cnpj":
      return cleanValue.length === 14;
    case "telefone":
      return cleanValue.length === 10 || cleanValue.length === 11;
    case "telefone_simples":
      return cleanValue.length === 8;
    case "celular":
      return cleanValue.length === 9 || cleanValue.length === 11;
    case "celular_simples":
      return cleanValue.length === 9;
    case "telefone_ddd":
      return cleanValue.length === 10;
    case "celular_ddd":
      return cleanValue.length === 11;
    case "rg":
      return cleanValue.length === 9;
    case "cep":
      return cleanValue.length === 8;
    case "data":
      return cleanValue.length === 8;
    case "hora":
      return cleanValue.length === 4;
    case "data_hora":
      return cleanValue.length === 12;
    case "placa":
      return removeTextMask(value).length === 7;
    case "cartao_credito":
      return cleanValue.length === 16;
    case "pix":
      return removeTextMask(value).length === 16;
    case "usd":
      return cleanValue.length > 0;
    case "brl":
      return cleanValue.length > 0;
    case "porcentagem":
      return cleanValue.length > 0;
    case "numero_inteiro":
      return cleanValue.length > 0;
    case "numero_decimal":
      return cleanValue.length > 0;
    default:
      return false;
  }
}; 