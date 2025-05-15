import { useQuery } from "@tanstack/react-query";
import { execApi } from "./useApi";
import { useEffect } from "react";

type useProposalLayoutRes = string;

type useProposalLayoutProps = {
  idGrupoProposta: string;
  successFn?: (data?: useProposalLayoutRes) => void;
  errorFn?: (error?: Error) => void;
};

export default function useProposalLayout({
  idGrupoProposta,
  successFn,
  errorFn,
}: Readonly<useProposalLayoutProps>) {
  const query = useQuery({
    queryKey: ["getProposalLayout", idGrupoProposta],
    queryFn: async () => {
      const res = await execApi({
        url: `api/crm/proposal/generate/unified/layout/${idGrupoProposta}`,
        data: {},
        method: "GET",
      });
      if (!res) {
        throw new Error("aconteceu algum erro ao buscar layout da proposta");
      }

      return res.data as useProposalLayoutRes;
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
