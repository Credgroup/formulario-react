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
  campo?: string;
  findTableColunaTemplate?: string; // Para o campo calcula_coluna_tabela (formato: "campoApiTabela:nmColunaTemplate")
  target?: string; // Para campos que são alvos de API
  apiConfig?: {
    type: "cep" | "custom";
    url?: string;
    method?: "GET" | "POST";
    targetFields?: {
      targetName: string;
      apiResponseKey: string;
    }[];
    triggerOnComplete?: boolean;
    debounceMs?: number;
    token?: string | null
  };
  tableFieldApiUrl?: string;
  tpDocumento?: number;
}

export interface TpOptions {
  value: string;
  label: string;
}

export interface SessaoType {
  id: string
  title: string;
  descricao: string;
  checked: boolean;
  disabled: boolean;
  campos: Partial<FieldType>[];
  active: boolean;
  typeSession?: "pagamento" | "input" | "documento" | "resumo";
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
