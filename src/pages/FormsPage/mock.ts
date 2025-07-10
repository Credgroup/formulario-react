import type { FieldType } from "@/types";

export const mockData: Partial<FieldType>[] = [
  {
    type: "titulo_subtitulo",
    sessao: "informacoes_segurado",
    dsTitulo: "Informações do Segurado",
    dsSubtitulo: "",
    campoApi: "titulo_informacoes_segurado"
  },
  {
    type: "text",
    nome: "Razão Social",
    obrigatorio: true,
    campoApi: "razao_social",
    visual: true,
    tamanho: "200",
    sessao: "informacoes_segurado"
  },
  {
    type: "text",
    nome: "CNPJ do Segurado",
    obrigatorio: true,
    campoApi: "cnpj_segurado",
    visual: true,
    tamanho: "18",
    mask: "cnpj",
    sessao: "informacoes_segurado"
  },
  {
    type: "text",
    nome: "Endereço",
    obrigatorio: true,
    campoApi: "endereco_segurado",
    visual: true,
    tamanho: "200",
    sessao: "informacoes_segurado"
  },
  {
    type: "text",
    nome: "Bairro",
    obrigatorio: true,
    campoApi: "bairro_segurado",
    visual: true,
    tamanho: "100",
    sessao: "informacoes_segurado"
  },
  {
    type: "text",
    nome: "Cidade",
    obrigatorio: true,
    campoApi: "cidade_segurado",
    visual: true,
    tamanho: "100",
    sessao: "informacoes_segurado"
  },
  {
    type: "text",
    nome: "Estado",
    obrigatorio: true,
    campoApi: "estado_segurado",
    visual: true,
    tamanho: "2",
    sessao: "informacoes_segurado"
  },
  {
    type: "text",
    nome: "CEP",
    obrigatorio: true,
    campoApi: "cep_segurado",
    visual: true,
    tamanho: "9",
    mask: "cep",
    sessao: "informacoes_segurado"
  },
  {
    type: "text",
    nome: "Atividade",
    obrigatorio: true,
    campoApi: "atividade_segurado",
    visual: true,
    tamanho: "200",
    sessao: "informacoes_segurado"
  },
  {
    type: "titulo_subtitulo",
    sessao: "informacoes_local_segurado",
    dsTitulo: "Informações do Local Segurado",
    dsSubtitulo: "",
    campoApi: "titulo_informacoes_local_segurado"
  },
  {
    type: "tabela",
    campoApi: "multiplas_respostas_tabela",
    nome: "Localização das lojas",
    placeholder: "Preencha as informações",
    obrigatorio: true,
    colunas: [
      {
        type: "text",
        nmColunaTemplate: "locais",
        nome: "Locais",
        placeholder: "Digite o endereço de risco",
        obrigatorio: true,
        conteudo: "",
        id: "2e645637-5b0b-4978-b877-69436c4d5917"
      },
      {
        type: "text",
        nmColunaTemplate: "endereco_risco",
        nome: "Endereço de Risco",
        placeholder: "Digite o endereço de risco",
        obrigatorio: true,
        conteudo: "",
        id: "2e626834-5b0b-4978-b877-69436c4d5917"
      },
      {
        type: "text",
        nome: "Atividade/Ocupação",
        nmColunaTemplate: "atividade_ocupacao",
        placeholder: "Digite a atividade/ocupação da empresa",
        obrigatorio: true,
        conteudo: "",
        id: "d8dfcb94-5a1e-4cc0-9996-998ba7d2f122"
      },
      {
        type: "text",
        nome: "Tipo de construção",
        nmColunaTemplate: "tipo_construcao",
        placeholder: "Digite o tipo de construção",
        obrigatorio: true,
        conteudo: "",
        id: "fe995257-3762-4313-a90f-82dc646ebd10"
      },
      {
        type: "text",
        nmColunaTemplate: "edificios_mmp",
        nome: "Edifícios + MMP",
        placeholder: "Edifícios + MMP",
        obrigatorio: true,
        conteudo: "",
        mask: "BRL",
        id: "f962a480-7b76-4f43-b02e-d7634e7ce510"
      },
      {
        type: "text",
        nmColunaTemplate: "maquinas_moveis_utensilios",
        nome: "Máquinas, Moveis e utensílios",
        placeholder: "Máquinas, Moveis e utensílios",
        obrigatorio: true,
        conteudo: "",
        mask: "BRL",
        id: "4bb887e8-fc47-42be-8222-e0c0867c5bd4"
      },
      {
        type: "text",
        nome: "Mercadorias e Matérias Primas",
        nmColunaTemplate: "mercadorias_materias_primas",
        placeholder: "Mercadorias e Matérias Primas",
        obrigatorio: true,
        conteudo: "",
        mask: "BRL",
        id: "f32d5ac6-2cb2-4526-a0e4-1c70b8314616"
      },
      {
        type: "text",
        nome: "Bens de 3º em poder do segurado",
        nmColunaTemplate: "bens_poder_segurado",
        placeholder: "Bens de 3º em poder do segurado",
        obrigatorio: true,
        conteudo: "",
        mask: "BRL",
        id: "f32d5ac6-2cb2-4526-a0e4-2ec70c7314616"
      },
      {
        type: "text",
        nome: "Total Danos Materiais",
        nmColunaTemplate: "total_danos_materiais",
        placeholder: "Total Danos Materiais",
        obrigatorio: true,
        conteudo: "",
        mask: "BRL",
        id: "g47d5ac6-3a4d-4526-a0e4-1c70b8314616"
      }
    ],
    conteudo: "",
    sessao: "001"
  },
  {
    type: "text",
    nome: "Endereço do Local",
    obrigatorio: true,
    campoApi: "endereco_local",
    visual: true,
    tamanho: "200",
    sessao: "informacoes_local_segurado"
  },
  {
    type: "text",
    nome: "Atividade/Ocupação do Local",
    obrigatorio: true,
    campoApi: "atividade_local",
    visual: true,
    tamanho: "200",
    sessao: "informacoes_local_segurado"
  },
  {
    type: "text",
    nome: "Tipo de Construção",
    obrigatorio: true,
    campoApi: "tipo_construcao",
    visual: true,
    tamanho: "100",
    sessao: "informacoes_local_segurado"
  },
  {
    type: "text",
    nome: "Valor Edifícios",
    obrigatorio: true,
    campoApi: "valor_edificios",
    visual: true,
    tamanho: "50",
    mask: "BRL",
    sessao: "informacoes_local_segurado"
  },
  {
    type: "text",
    nome: "Valor Máquinas, Móveis e Utensílios",
    obrigatorio: true,
    campoApi: "valor_maquinas_moveis_utensilios",
    visual: true,
    tamanho: "50",
    mask: "BRL",
    sessao: "informacoes_local_segurado"
  },
  {
    type: "text",
    nome: "Valor Mercadorias e Matérias-Primas",
    obrigatorio: true,
    campoApi: "valor_mercadorias_materias_primas",
    visual: true,
    tamanho: "50",
    mask: "BRL",
    sessao: "informacoes_local_segurado"
  },
  {
    type: "text",
    nome: "Valor Bens de Terceiros",
    obrigatorio: true,
    campoApi: "valor_bens_terceiros",
    visual: true,
    tamanho: "50",
    mask: "BRL",
    sessao: "informacoes_local_segurado"
  },
  {
    type: "text",
    nome: "Total Danos Materiais",
    obrigatorio: true,
    campoApi: "total_danos_materiais",
    visual: true,
    tamanho: "50",
    mask: "BRL",
    sessao: "informacoes_local_segurado"
  },
  {
    type: "text",
    nome: "Lucros Cessantes",
    obrigatorio: false,
    campoApi: "lucros_cessantes",
    visual: true,
    tamanho: "50",
    mask: "BRL",
    sessao: "informacoes_local_segurado"
  },
  {
    type: "titulo_subtitulo",
    sessao: "sistemas_protecao",
    dsTitulo: "Sistemas de Proteção",
    dsSubtitulo: "",
    campoApi: "titulo_sistemas_protecao"
  },
  {
    type: "textarea",
    nome: "Descrever percentual das áreas produtivas, armazenagem e outros",
    obrigatorio: false,
    campoApi: "desc_areas_produtivas",
    visual: true,
    tamanho: "500",
    sessao: "sistemas_protecao"
  },
 {
    type: "combo_checkbox",
    nome: "Caracteristicas construtivas das Parades (internas e externas) e Teto:",
    obrigatorio: true,
    campoApi: "caracteristicas_construtivas",
    visual: true,
    tamanho: "10",
    sessao: "sistemas_protecao",
    "options": "Concreto:Concreto;Concreto/Alvenaria:Concreto/Alvenaria;Metalica:Metalica;Maderia:Maderia;Isopainel:Isopainel"
  },
{
    type: "textarea",
    nome: "Existência de inflamáveis ? (Quais, quantidades e localização na planta) - eventual segregação das demais atividades",
    obrigatorio: false,
    campoApi: "exisstencia_inflamaveis",
    visual: true,
    tamanho: "500",
    sessao: "sistemas_protecao"
  },
{
    type: "textarea",
    nome: "Existência de mercadorias frigorificadas ? Especificar tipos e quantidades",
    obrigatorio: false,
    campoApi: "existencia_mercadorias_frig",
    visual: true,
    tamanho: "500",
    sessao: "sistemas_protecao"
  },
{
    type: "textarea",
    nome: "Quantidades, material de construção da(s) câmara(s) fria(s) e localização na planta",
    obrigatorio: false,
    campoApi: "existencia_camaras_frias",
    visual: true,
    tamanho: "500",
    sessao: "sistemas_protecao"
  },
{
    type: "textarea",
    nome: "Em caso de existência de isopainel ou similares na construção, informar o percentual do mesmo sobre o total da área construída, informar se é no teto ou paredes (internas ou externas) e informar o recheio do mesmo.",
    obrigatorio: false,
    campoApi: "Desc_proteao_paredes",
    visual: true,
    tamanho: "500",
    sessao: "sistemas_protecao"
  },
{
    type: "tex",
    nome: " Tipo de isolamento (poliestireno isopor, lã de vidro, lã de rocha)?",
    obrigatorio: false,
    campoApi: "Tipo_isolamento",
    visual: true,
    tamanho: "100",
    sessao: "sistemas_protecao"
  },
{
    type: "textarea",
    nome: "Informar o tipo de mercadorias armazenadas, se no depósito há espaço dedicado somente para as mercadorias próprias.",
    obrigatorio: false,
    campoApi: "Desctipomercadoriaarmazenada",
    visual: true,
    tamanho: "500",
    sessao: "sistemas_protecao"
  },

  {
    type: "combo_checkbox",
    nome: "AVCB Vigente",
    obrigatorio: true,
    campoApi: "avcb_vigente",
    visual: true,
    tamanho: "10",
    sessao: "sistemas_protecao",
    "options": "Sim:Sim;Não:Não"
  },
  {
     type: "combo_checkbox",
    nome: "Extintores Suficientes e Válidos",
    obrigatorio: true,
    campoApi: "extintores_suficientes",
    visual: true,
    tamanho: "10",
    sessao: "sistemas_protecao",
   "options": "Sim:Sim;Não:Não"
  },
  {
    type: "combo_checkbox",
    nome: "Hidrantes",
    obrigatorio: true,
    campoApi: "hidrantes",
    visual: true,
    tamanho: "10",
    sessao: "sistemas_protecao",
    "options": "Sim:Sim;Não:Não"
  },
  {
    type: "combo_checkbox",
    nome: "Brigada de Incêndio Formalizada",
    obrigatorio: true,
    campoApi: "brigada_incendio",
    visual: true,
    tamanho: "10",
    sessao: "sistemas_protecao",
   "options": "Sim:Sim;Não:Não"
  },
  {
   type: "combo_checkbox",
    nome: "Sprinklers",
    obrigatorio: true,
    campoApi: "sprinklers",
    visual: true,
    tamanho: "10",
    sessao: "sistemas_protecao",
   "options": "Sim:Sim;Não:Não"
  },
  {
    type: "combo_checkbox",
    nome: "Pára-raios",
    obrigatorio: true,
    campoApi: "para_raios",
    visual: true,
    tamanho: "10",
    sessao: "sistemas_protecao",
    "options": "Sim:Sim;Não:Não"
  },
  {
    type: "combo_checkbox",
    nome: "Vigilância 24 Horas Armada",
    obrigatorio: true,
    campoApi: "vigilancia_24h",
    visual: true,
    tamanho: "10",
    sessao: "sistemas_protecao",
     "options": "Sim:Sim;Não:Não"
  },
  {
   type: "combo_checkbox",
    nome: "Sistema de Detecção de Fumaça ou Alarme",
    obrigatorio: true,
    campoApi: "deteccao_fumaca",
    visual: true,
    tamanho: "10",
    sessao: "sistemas_protecao",
   "options": "Sim:Sim;Não:Não"
  }
];