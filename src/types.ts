export interface FieldType {
  type: string;
  sessao?: string;
  conteudo?: string;
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
  visual?: boolean;
  desabilitar?: boolean;
  dominio?: boolean;
  dateConfig?: string;
  qtdRespostas?: number;
  colunas?: ColunaType[];
  uploadAccepts?: string;
  uploadMaxSize?: number;
  qtd?: number;
  camposCondicionais?: FieldType[];
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
  isFilesType?: boolean;
}

export interface ColunaType {
  id?: string;
  type: string;
  conteudo?: string;
  placeholder?: string;
  nome?: string;
  obrigatorio?: boolean;
  tamanho?: string;
  campoApi?: string;
  options?: TpOptions[] | string;
  mask?: string;
  dominio?: boolean;
  nmColunaTemplate?: string;
  dateConfig?: string;
  contador?: boolean
}
