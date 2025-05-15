import { useQuery } from "@tanstack/react-query";
import { execApi } from "./useApi";
import { useEffect } from "react";

type usePersonInfosRes = {
  idSeguradoI2k: string;
  name: string;
  products: string[];
};

type usePersonInfosProps = {
  idGrupoProposta: string;
  successFn?: (data?: usePersonInfosRes) => void;
  errorFn?: (error?: Error) => void;
};

export default function usePersonInfos({
  idGrupoProposta,
  successFn,
  errorFn,
}: Readonly<usePersonInfosProps>) {
  const query = useQuery({
    queryKey: ["personInfos", idGrupoProposta],
    queryFn: async () => {
      const res = await execApi({
        url: `/api/ProposalGroup/${idGrupoProposta}/Person`,
        data: {},
        method: "GET",
      });
      if (!res) {
        throw new Error("aconteceu algum erro");
      }

      return res.data as usePersonInfosRes;
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
