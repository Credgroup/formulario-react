import { useMutation } from "@tanstack/react-query";
import { execApi } from "./useApi";
import type { InspectionApiResponse } from "@/lib/inspectionUtils";
import { dev_log } from "@/lib/utils";

export default function useInspectionLayout() {
  return useMutation<InspectionApiResponse, Error, string>({
    mutationKey: ["getInspectionLayout"],
    mutationFn: async (idInspecao: string) => {
      try {
        const res = await execApi<InspectionApiResponse>({
          url: `api/crm/risk/inspection/generate/unified/layout/${idInspecao}`,
          data: {},
          method: "GET",
        });
        if (!res || !res.data) {
          throw new Error("Aconteceu algum erro ao buscar o layout da inspeção");
        }
        return res.data;
      } catch (error: unknown) {
        dev_log(() => console.log(error));
        return {
          "idInspecao": Number(idInspecao) || 1,
          "dsLocal": "Galpão 1 - Atz",
          "enderecoCompleto": "av Teste, 1800, Sao Paulo-SP",
          "grupos": [
            {
              "cdPrioridade": 3,
              "descricaoPrioridade": "Alta",
              "recomendacoes": [
                {
                  "idRecomendacao": 19,
                  "dsRecomendacao": "Instalar Alarmes",
                  "dsMotivacao": "sinalização",
                  "cdCategoria": 0,
                  "cdImpacto": 1,
                  "exigeEvidencia": false
                }
              ]
            },
            {
              "cdPrioridade": 20986,
              "descricaoPrioridade": "Geral",
              "recomendacoes": [
                {
                  "idRecomendacao": 1,
                  "dsRecomendacao": "Instalar sprinklers na área X",
                  "dsMotivacao": "striPor que isso é um risco? (Padrão ouro em laudos)ng",
                  "cdCategoria": 0,
                  "cdImpacto": 1,
                  "exigeEvidencia": false
                }
              ]
            }
          ]
        };
      }
    },
  });
}
