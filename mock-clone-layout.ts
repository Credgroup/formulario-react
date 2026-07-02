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
        options: "Combate Manual à Incêndio:20994;Detecção e Sistemas Fixos de Proteção:20995;Programas de Gerenciamento:20997;Utilidades e Riscos Incidentais:20998;",
        sessao: "recomendacao_1"
    },
    {
        type: "select",
        nome: "Prioridade",
        campoApi: "prioridade",
        obrigatorio: true,
        conteudo: "",
        options: "baixa:20984;Média:20985;Alta:20986;Crítica:20987;",
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