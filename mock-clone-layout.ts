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

const vistoriaLayout: Partial<FieldType>[] = [
    {
        type: "titulo_subtitulo",
        dsTitulo: "Vistoria",
        dsSubtitulo: "Preencha os dados para criar a vistoria",
        sessao: "vistoria"
    },
    {
        type: "select",
        nome: "Status da Vistoria",
        campoApi: "statusVistoria",
        obrigatorio: true,
        conteudo: "2",
        options: "Agendada:1;Em andamento:2;Em atraso:3;Concluída:4;Cancelada:5;",
        sessao: "vistoria",
        desabilitar: false
    },
    {
        type: "select",
        nome: "Tipo da Vistoria",
        campoApi: "tipoVistoria",
        obrigatorio: true,
        conteudo: "2",
        options: "Rotina:1;Preventiva:2;Corretiva:3;Sinistro:4;Auditoria:5;Pré-plantio:6;Pós-colheita:7;",
        sessao: "vistoria",
        desabilitar: false
    },
    {
        type: "text",
        nome: "Objetivo da Vistoria",
        campoApi: "objetivoVistoria",
        obrigatorio: true,
        conteudo: "Avaliar as condições da lavoura de soja e identificar possíveis não conformidades.",
        sessao: "vistoria",
        // desabilitar: false
    },
    {
        type: "date",
        nome: "Data de Agendamento",
        campoApi: "dtAgendamento",
        obrigatorio: true,
        conteudo: "2026-07-08 08:30:00",
        sessao: "vistoria",
        desabilitar: false
    },
    {
        type: "date",
        nome: "Data de Realização",
        campoApi: "dtRealizacao",
        obrigatorio: true,
        conteudo: "2026-07-08 09:00:00",
        sessao: "vistoria",
        desabilitar: false
    },
    {
        type: "date",
        nome: "Data de Conclusão",
        campoApi: "dtConclusao",
        obrigatorio: false,
        conteudo: "2026-07-08 11:15:00",
        sessao: "vistoria",
        desabilitar: false
    },
    {
        type: "number",
        nome: "Área Total da Vistoria (ha)",
        campoApi: "areaTotalVistoria",
        obrigatorio: true,
        conteudo: "42.8",
        sessao: "vistoria",
        desabilitar: false
    },
    {
        type: "select",
        nome: "Prioridade",
        campoApi: "prioridade",
        obrigatorio: true,
        conteudo: "2",
        options: "Baixa:1;Média:2;Alta:3;Crítica:4;",
        sessao: "vistoria",
        desabilitar: false
    },
    {
        type: "select",
        nome: "Avaliação Geral",
        campoApi: "avaliacaoGeral",
        obrigatorio: true,
        conteudo: "2",
        options: "Excelente:1;Boa:2;Regular:3;Ruim:4;Crítica:5;",
        sessao: "vistoria",
        desabilitar: false
    },
    {
        type: "select",
        nome: "Condição Climática",
        campoApi: "condicaoClimatica",
        obrigatorio: true,
        conteudo: "1",
        options: "Ensolarado:1;Nublado:2;Chuva:3;Ventania:4;Neblina:5;",
        sessao: "vistoria",
        desabilitar: false
    },
    {
        type: "date",
        nome: "Próxima Vistoria",
        campoApi: "dtProximaVistoria",
        obrigatorio: false,
        conteudo: "2026-07-22",
        sessao: "vistoria",
        desabilitar: false
    }
]


export { vistoriaLayout, fields }