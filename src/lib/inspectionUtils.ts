import type { FieldType } from "@/types";

export interface Recommendation {
  idRecomendacao: number;
  dsRecomendacao: string;
  dsMotivacao: string;
  cdCategoria: number;
  dsCategoriaRisco: string;
  cdPrioridade: number;
  dsPrioridade: string;
  exigeEvidencia: boolean;
}

export interface RecommendationGroup {
  cdPrioridade: number;
  descricaoPrioridade: string;
  recomendacoes: Recommendation[];
}

export interface InspectionApiResponse {
  idInspecao: number;
  dsLocal: string;
  enderecoCompleto: string;
  grupos: RecommendationGroup[];
}

/**
 * Converts the raw inspection API response into an array of FieldType objects
 * matching the layout system of mock.ts.
 */
export function generateInspectionLayout(data: InspectionApiResponse): Partial<FieldType>[] {
  const fields: Partial<FieldType>[] = [];

  // --- Session: Dados Gerais ---
  const sessaoDadosGerais = "Dados Gerais";

  // Section Header
  fields.push({
    type: "titulo_subtitulo",
    sessao: sessaoDadosGerais,
    dsTitulo: "Dados Gerais da Inspeção",
    dsSubtitulo: "Informações gerais sobre o local e endereço",
    obrigatorio: false,
    desabilitar: true,
    campoCompartilhado: false,
    dominio: false,
  });

  // dsLocal Field
  fields.push({
    campoApi: "dsLocal",
    nome: "Local",
    conteudo: data.dsLocal || "",
    type: "text",
    sessao: sessaoDadosGerais,
    desabilitar: true,
    obrigatorio: false,
    campoCompartilhado: false,
    dominio: false,
  });

  // enderecoCompleto Field
  fields.push({
    campoApi: "enderecoCompleto",
    nome: "Endereço Completo",
    conteudo: data.enderecoCompleto || "",
    type: "text",
    sessao: sessaoDadosGerais,
    desabilitar: true,
    obrigatorio: false,
    campoCompartilhado: false,
    dominio: false,
  });

  // --- Sessions: Recomendações ---
  if (data.grupos && Array.isArray(data.grupos)) {
    data.grupos.forEach((grupo) => {
      const prioridade = grupo.descricaoPrioridade || "Geral";
      if (grupo.recomendacoes && Array.isArray(grupo.recomendacoes)) {
        grupo.recomendacoes.forEach((rec) => {
          const sessaoName = `Recomendação ${rec.idRecomendacao}`;

          // Section Header
          fields.push({
            type: "titulo_subtitulo",
            sessao: sessaoName,
            dsTitulo: `Recomendação ${rec.idRecomendacao}`,
            dsSubtitulo: `Prioridade: ${prioridade}`,
            obrigatorio: false,
            desabilitar: true,
            campoCompartilhado: false,
            dominio: false,
          });

          // dsRecomendacao Field
          fields.push({
            campoApi: `dsRecomendacao_${rec.idRecomendacao}`,
            nome: "Recomendação",
            conteudo: rec.dsRecomendacao || "",
            type: "text",
            sessao: sessaoName,
            desabilitar: true,
            obrigatorio: false,
            campoCompartilhado: false,
            dominio: false,
          });

          // dsMotivacao Field
          fields.push({
            campoApi: `dsMotivacao_${rec.idRecomendacao}`,
            nome: "Motivação",
            conteudo: rec.dsMotivacao || "",
            type: "text",
            sessao: sessaoName,
            desabilitar: true,
            obrigatorio: false,
            campoCompartilhado: false,
            dominio: false,
          });

          // cdCategoria Field
          fields.push({
            campoApi: `dsCategoriaRisco_${rec.idRecomendacao}`,
            nome: "Categoria",
            conteudo: rec.dsCategoriaRisco !== undefined ? String(rec.dsCategoriaRisco) : "",
            type: "text",
            sessao: sessaoName,
            desabilitar: true,
            obrigatorio: false,
            campoCompartilhado: false,
            dominio: true,
          });

          // cdImpacto Field
          fields.push({
            campoApi: `dsPrioridade_${rec.idRecomendacao}`,
            nome: "Prioridade",
            conteudo: rec.cdPrioridade !== undefined ? String(rec.dsPrioridade) : "",
            type: "text",
            sessao: sessaoName,
            desabilitar: true,
            obrigatorio: false,
            campoCompartilhado: false,
            dominio: true,
          });

          // respostaCliente Field (Editable textarea)
          fields.push({
            campoApi: `respostaCliente_${rec.idRecomendacao}`,
            nome: "Comentário do Cliente",
            conteudo: "",
            type: "textarea",
            sessao: sessaoName,
            desabilitar: false,
            obrigatorio: false,
            campoCompartilhado: false,
            dominio: false,
          });

          // evidencia Field (Editable file upload)
          fields.push({
            campoApi: `evidencia_recomendacao_${rec.idRecomendacao}`,
            nome: "Evidencia",
            conteudo: "",
            type: "file",
            sessao: sessaoName,
            desabilitar: false,
            obrigatorio: false,
            campoCompartilhado: false,
            dominio: false,
          });
        });
      }
    });
  }

  return fields;
}
