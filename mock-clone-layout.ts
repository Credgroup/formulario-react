import { type FieldType } from './src/types';

// campos necessários: nmRecomendacao, dsMotivoRecomendacao, categoriaRisco (categoria1, categoria2), prioridade (baixa, media, alta, critica), dtPrazoSla, documentoVinculado

const fields: Partial<FieldType>[] = [
    {
        type: "titulo_subtitulo",
        dsTitulo: "Recomendação 1",
        dsSubtitulo: "Preencha os dados para criar a recomendação",
        sessao: "recomendacao_1"
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
        conteudo: "",
        sessao: "recomendacao_1"
    },
    {
        type: "select",
        nome: "Categoria Risco",
        campoApi: "categoriaRisco",
        obrigatorio: true,
        conteudo: "",
        options: "opcao1:1,opcao2:2",
        sessao: "recomendacao_1"
    },
    {
        type: "select",
        nome: "Prioridade",
        campoApi: "prioridade",
        obrigatorio: true,
        conteudo: "",
        options: "opcao1:1,opcao2:2,opcao3:3,opcao4:4",
        sessao: "recomendacao_1"
    },
    {
        type: "date",
        nome: "Data Prazo SLA",
        campoApi: "dtPrazoSla",
        obrigatorio: true,
        conteudo: "",
        sessao: "recomendacao_1"
    },
    {
        type: "file",
        nome: "Arquivos",
        campoApi: "arquivos",
        obrigatorio: true,
        conteudo: "",
        sessao: "recomendacao_1"
    }
]

export default fields;