import type { FieldType } from "@/types";

export const mockData: Partial<FieldType>[] = [
  {
    type: "tabela",
    campoApi: "cossegurado",
    nome: "Dados Cossegurado",
    placeholder: "Preencha as informações",
    // obrigatorio: true,
    colunas: [
      {
        type: "number",
        contador: true,
        nmColunaTemplate: "numero_segurado",
        nome: "numero segurado",
        conteudo: ""
      },
      {
        type: "text",
        nmColunaTemplate: "razao_social",
        nome: "Razão Social",
        placeholder: "Digite a razão do segurado",
        obrigatorio: true,
        conteudo: "",
        id: "2e645637-5b0b-4978-b877-69436c4d8976",
      },
      {
        type: "text",
        nmColunaTemplate: "cnpj",
        nome: "C.N.P.J",
        placeholder: "Digite o CNPJ do Cossegurado",
        obrigatorio: true,
        conteudo: "",
        id: "2e626834-5b0b-4978-b877-69436c4d6543",
      },
    ],
    conteudo: "",
  },
  {
    type: "text",
    nome: "cpf cossegurado",
    // placeholder: "Digite o CPF do cossegurado",
    // obrigatorio: true,
    conteudo: "",
    mask: "cpf"
  },
];
