import type { FieldType } from "@/types";

export const mockData: Partial<FieldType>[] = [
  {
    type: "file",
    nome: "Documento de Identificação",
    obrigatorio: true,
    campoApi: "documento_identificacao",
    visual: true,
    uploadAccepts: "image/*,.pdf",
    uploadMaxSize: 1024 * 1024 * 5, // 5MB
    qtd: 1,
    sessao: "informacoes_segurado",
    conteudo: '[{"nomeArquivo":"documento.pdf","base64":"data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO..."}]'
  },
  {
    type: "file",
    nome: "Contrato Social",
    obrigatorio: false,
    campoApi: "contrato_social",
    visual: true,
    uploadAccepts: ".pdf,.doc,.docx",
    uploadMaxSize: 1024 * 1024 * 10,
    qtd: 3,
    sessao: "informacoes_segurado",
    conteudo: '[{"nomeArquivo":"contrato.pdf","base64":"data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO..."},{"nomeArquivo":"anexo.doc","base64":"data:application/msword;base64,JVBERi0xLjQKJcOkw7zDtsO..."},{"nomeArquivo":"complemento.docx","base64":"data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,JVBERi0xLjQKJcOkw7zDtsO..."}]'
  },  
  {
    type: "condicional",
    nome: "Você trabalha?",
    obrigatorio: false,
    campoApi: "lucro_cessante_condicional",
    visual: true,
    sessao: "informacoes_local_segurado",
    tamanho: "50",
    camposCondicionais: [
      {
        type: "text",
        nome: "Lucro Cessante",
        obrigatorio: true,
        campoApi: "lucro_cessante",
        visual: true,
        mask: "BRL",
      },
    ],
    conteudo: ""
  },
  {
    type: "file",
    nome: "Anexos Complementares",
    obrigatorio: true,
    campoApi: "arquivos_complementares",
    visual: true,
    uploadAccepts: "image/*,.pdf",
    uploadMaxSize: 1024 * 1024 * 15, 
    qtd: 5,
    conteudo: '[{"nomeArquivo":"foto1.jpg","base64":"data:image/jpeg;base64,JVBERi0xLjQKJcOkw7zDtsO..."},{"nomeArquivo":"foto2.png","base64":"data:image/png;base64,JVBERi0xLjQKJcOkw7zDtsO..."},{"nomeArquivo":"documento.pdf","base64":"data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO..."}]'
  },
  {
    type: "file",
    nome: "Relatório Técnico",
    obrigatorio: false,
    campoApi: "relatorio_tecnico",
    visual: true,
    uploadAccepts: ".pdf,.doc,.docx,.xls,.xlsx",
    uploadMaxSize: 1024 * 1024 * 20,
    qtd: 10,
    sessao: "informacoes_local_segurado",
    conteudo: '' // Campo vazio para testar "--"
  },
  
];