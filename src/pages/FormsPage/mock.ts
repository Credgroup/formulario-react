import type { FieldType } from "@/types";

export const mockData: Partial<FieldType>[] = [
  {
    type: "tabela",
    nome: "Funcionários",
    campoApi: "funcionarios",
    colunas: [
      {
        id: "1",
        type: "text",
        nome: "Nome",
        nmColunaTemplate: "nome",
        obrigatorio: true
      },
      {
        id: "2", 
        type: "text",
        nome: "Cargo",
        nmColunaTemplate: "cargo",
        obrigatorio: true
      },
      {
        id: "3",
        type: "text", 
        nome: "Salário",
        nmColunaTemplate: "salario",
        mask: "brl",
        obrigatorio: true
      }
    ],
    conteudo: "",
  },
  {
    type: "calcula_coluna_tabela",
    findTableColunaTemplate: "funcionarios:salario",
    nome: "Total de Salários",
    mask: "brl",
    campoApi: "total_salarios",
    obrigatorio: false,
    conteudo: ""
  }
];