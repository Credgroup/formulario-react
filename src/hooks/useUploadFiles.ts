import { base64ToFile } from "@/pages/FormsPage/components/UploadFileField/utils";
import type { FieldType } from "@/types";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";

type fileContentObj = {
  base64: string;
  nomeArquivo: string;
};
type UploadFilesParams = {
  field: Partial<FieldType>;
  idProposalGroup?: string | null;
};
export const uploadFiles = async ({
  field,
  idProposalGroup,
}: Readonly<UploadFilesParams>) => {
  if (!idProposalGroup) {
    throw new Error("idProposalGroup não encontrado");
  }

  const header: AxiosRequestConfig = {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Strict-Transport-Security":
        "max-age=2592000; includeSubDomains; preload",
      "Content-Type": "multipart/form-data",
      Authorization: "bearer ",
    },
  };

  const formData = new FormData();
  const conf = JSON.stringify({
    campoApi: field.campoApi,
    idGrupoProposta: idProposalGroup,
  });

  formData.append("Conf", conf);
  if (field.conteudo) {
    const jsonObj: fileContentObj[] = JSON.parse(field.conteudo);

    if (jsonObj.length >= 1) {
      const filesToSend = jsonObj.map((file) =>
        base64ToFile(file.base64, file.nomeArquivo)
      );
      
      filesToSend.forEach(file =>{
          formData.append("Files", file);
      })
    }
  }

  const res = await axios.post(
    `${
      import.meta.env.VITE_URL_DOTCORE
    }api/crm/document/ocr/import/groupProposal`,
    formData,
    header
  );

  if (!res.data.success) {
    throw new Error(res.data.dsErro);
  }

  return res;
};
