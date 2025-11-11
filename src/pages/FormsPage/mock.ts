import type { FieldType } from "@/types";

export const mockData: Partial<FieldType>[] = [

  {

  "obrigatorio": false,

  "type": "titulo_subtitulo",

  "sessao": "Dados Segurado",

  "dsSubtitulo": "Dados gerais do segurado",

  "dsTitulo": "Dados Segurado",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false

  },

  {

  "campoApi": "nmSegurado",

  "nome": "Nome Completo",

  "obrigatorio": true,

  "type": "text",

  "sessao": "Dados Segurado",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false,

  "tamanho": "100"

  },

  {

  "campoApi": "nmSocial",

  "nome": "Nome Social",

  "obrigatorio": true,

  "type": "text",

  "sessao": "Dados Segurado",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false,

  "tamanho": "100"

  },

  {

  "campoApi": "tpSexo",

  "nome": "Sexo",

  "obrigatorio": true,

  "type": "select",

  "sessao": "Dados Segurado",

  "options": "Masculino:1;Feminino:2;Outro:3",

  "campoCompartilhado": false,

  "dominio": true,

  "desabilitar": false

  },

  {

  "campoApi": "dtNascimento",

  "nome": "Data Nascimento",

  "obrigatorio": true,

  "type": "text",

  "sessao": "Dados Segurado",

  "campoCompartilhado": false,

  "mask": "data",

  "dominio": false,

  "desabilitar": false

  },

  {

  "campoApi": "nrCpf",

  "nome": "Cpf",

  "obrigatorio": true,

  "type": "text",

  "sessao": "Dados Segurado",

  "campoCompartilhado": false,

  "mask": "cpf",

  "dominio": false,

  "desabilitar": false,

  "tamanho": "11"

  },

  {

  "campoApi": "tpEstadoCivil",

  "nome": "Estado Civíl",

  "obrigatorio": true,

  "type": "select",

  "sessao": "Dados Segurado",

  "options": "Solteiro:1;Casado:2;Viúvo:3;Separado:4;Divorciado:5;Sem registro:6",

  "campoCompartilhado": false,

  "dominio": true,

  "desabilitar": false

  },

  {

  "campoApi": "nrDdd",

  "nome": "DDD",

  "obrigatorio": true,

  "type": "text",

  "sessao": "Dados Segurado",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false,

  "tamanho": "2"

  },

  {

  "campoApi": "telefone",

  "nome": "Celular",

  "obrigatorio": true,

  "type": "text",

  "sessao": "Dados Segurado",

  "campoCompartilhado": true,

  "mask": "celular_simples",

  "dominio": false,

  "desabilitar": false

  },

  {

  "campoApi": "dsEmail",

  "nome": "Email",

  "obrigatorio": true,

  "type": "email",

  "sessao": "Dados Segurado",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false

  },

  {

  "obrigatorio": false,

  "type": "titulo_subtitulo",

  "sessao": "endereco_segurado",

  "dsSubtitulo": "Informações da localização do segurado",

  "dsTitulo": "Endereço do segurado",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false

  },

  {

  "campoApi": "NrCEP",

  "nome": "CEP",

  "obrigatorio": true,

  "type": "text",

  "sessao": "endereco_segurado",

  "campoCompartilhado": false,

  "mask": "cep",

  "dominio": false,

  "desabilitar": false,

  "apiConfig": {

  "type": "cep",

  "targetFields": [

  {

  "targetName": "logradouro",

  "apiResponseKey": "logradouro"

  },

  {

  "targetName": "bairro",

  "apiResponseKey": "bairro"

  },

  {

  "targetName": "cidade",

  "apiResponseKey": "localidade"

  },

  {

  "targetName": "estado",

  "apiResponseKey": "uf"

  }

  ],

  "triggerOnComplete": true,

  "debounceMs": 500

  }

  },

  {

  "campoApi": "NmLogradouro",

  "nome": "Logradouro",

  "obrigatorio": true,

  "type": "text",

  "sessao": "endereco_segurado",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false,

  "target": "logradouro"

  },

  {

  "campoApi": "NrLogradouro",

  "nome": "Número",

  "obrigatorio": true,

  "type": "text",

  "sessao": "endereco_segurado",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false,

  "target": "numero"

  },

  {

  "campoApi": "DsComplemento",

  "nome": "Complemento",

  "obrigatorio": false,

  "type": "text",

  "sessao": "endereco_segurado",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false,

  "target": "complemento"

  },

  {

  "campoApi": "NmBairro",

  "nome": "Bairro",

  "obrigatorio": true,

  "type": "text",

  "sessao": "endereco_segurado",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false,

  "target": "bairro"

  },

  {

  "campoApi": "NmCidade",

  "nome": "Cidade",

  "obrigatorio": true,

  "type": "text",

  "sessao": "endereco_segurado",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false,

  "target": "cidade"

  },

  {

  "campoApi": "CdUF",

  "nome": "Estado",

  "obrigatorio": true,

  "type": "select",

  "sessao": "endereco_segurado",

  "options": "AC:AC;AL:AL;AP:AP;AM:AM;BA:BA;CE:CE;DF:DF;ES:ES;GO:GO;MA:MA;MT:MT;MS:MS;MG:MG;PA:PA;PB:PB;PR:PR;PE:PE;PI:PI;RJ:RJ;RN:RN;RS:RS;RO:RO;RR:RR;SC:SC;SP:SP;SE:SE;TO:TO",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false,

  "target": "estado"

  },

  {

  "obrigatorio": false,

  "type": "pagamento",

  "campoCompartilhado": false,

  "dominio": false,

  "desabilitar": false

  }

]