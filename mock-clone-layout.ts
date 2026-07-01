import { type FieldType } from './src/types';

// campos necessários: nmRecomendacao, dsMotivoRecomendacao, categoriaRisco (categoria1, categoria2), prioridade (baixa, media, alta, critica), dtPrazoSla, documentoVinculado

const fields: Partial<FieldType>[] = [
    {
        type: "titulo_subtitulo",
        dsTitulo: "Recomendação 1",
        dsSubtitulo: "Preencha os dados para criar a recomendação"
    },
    {
        type: "text",
        nome: "Nome Recomendação",
        campoApi: "nmRecomendacao",
        obrigatorio: true,
        conteudo: "",
        sessao: "recomendacao_1"
    },
    {
        type: "textarea",
        nome: "Descrição Recomendação",
        campoApi: "dsMotivoRecomendacao",
        obrigatorio: true,
        conteudo: ""
    },
    {
        type: "select",
        nome: "Categoria Risco",
        campoApi: "categoriaRisco",
        obrigatorio: true,
        conteudo: "",
        options: "opcao1:1,opcao2:2"
    },
    {
        type: "select",
        nome: "Prioridade",
        campoApi: "prioridade",
        obrigatorio: true,
        conteudo: "",
        options: "opcao1:1,opcao2:2,opcao3:3,opcao4:4"
    },
    {
        type: "date",
        nome: "Data Prazo SLA",
        campoApi: "dtPrazoSla",
        obrigatorio: true,
        conteudo: ""
    },
    {
        type: "text",
        nome: "Documento Vinculado",
        campoApi: "documentoVinculado",
        obrigatorio: true,
        conteudo: ""
    },
    {
        type: "file",
        nome: "Arquivos",
        campoApi: "arquivos",
        obrigatorio: true,
        conteudo: ""
    }
]

export default fields;