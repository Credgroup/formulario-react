export interface FieldType {
  type: string;
  sessao?: string;
  conteudoCampoApi?: string;
  placeholder?: string;
  nome?: string;
  obrigatorio?: boolean;
  tamanho?: string;
  campoCompartilhado?: boolean;
  campoApi?: string;
  produtoOrigem?: number;
  dsTitulo?: string;
  dsSubtitulo?: string;
  options?: TpOptions[] | string;
  calculo?: string;
  mask?: string;
}

export interface TpOptions {
  value: string;
  label: string;
}

export interface SessaoType {
  title: string;
  descricao: string;
  checked: boolean;
  disabled: boolean;
  campos: Partial<FieldType>[];
  active: boolean;
  isInputType?: boolean;
}
