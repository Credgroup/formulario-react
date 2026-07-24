import { useQuery } from "@tanstack/react-query";
import { execApi } from "./useApi";
import { useEffect } from "react";

type useProposalLayoutProps = {
  idGrupoProposta: string;
  tpLayout?: string;
  successFn?: (data?: string) => void;
  errorFn?: (error?: Error) => void;
};

export default function useProposalLayout({
  idGrupoProposta,
  tpLayout,
  successFn,
  errorFn,
}: Readonly<useProposalLayoutProps>) {
  const query = useQuery({
    queryKey: ["getProposalLayout", idGrupoProposta, tpLayout],
    queryFn: async () => {
      const urlQuery = tpLayout ? `?tpLayout=${tpLayout}` : '';
      const res = await execApi({
        url: `api/crm/proposal/generate/unified/layout/${idGrupoProposta}${urlQuery}`,
        data: {},
        method: "GET",
      });
      if (!res) {
        throw new Error("aconteceu algum erro ao buscar layout da proposta");
      }

      return res.data as string;
    },
    enabled: !!idGrupoProposta,
  });

  useEffect(() => {
    if (query.isSuccess && query.data && successFn) {
      successFn(query.data);
    }
  }, [query.isSuccess]);

  useEffect(() => {
    if (query.isError && query.error && errorFn) {
      errorFn(query.error);
    }
  }, [query.isError]);

  return {
    ...query,
  };
}
