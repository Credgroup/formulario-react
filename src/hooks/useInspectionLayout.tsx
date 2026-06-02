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
        console.log(res)
        if (!res || !res.data) {
          throw new Error("Aconteceu algum erro ao buscar o layout da inspeção");
        }
        return res.data;
      } catch (error: unknown) {
        dev_log(() => console.log(error));
        throw error
      }
    },
  });
}
