# Campo Calcula Coluna Tabela

## Descrição
O campo `calcula_coluna_tabela` é um componente especial que permite calcular a soma de todos os valores de uma coluna específica dentro de um campo tabela.

## Como Usar

### 1. Estrutura do Campo
```json
{
  "type": "calcula_coluna_tabela",
  "findTableColunaTemplate": "funcionarios:salario",
  "nome": "Total de Salários",
  "mask": "brl",
  "campoApi": "total_salarios",
  "obrigatorio": false,
  "conteudo": ""
}
```

### 2. Propriedades Obrigatórias
- **type**: Deve ser sempre `"calcula_coluna_tabela"`
- **findTableColunaTemplate**: Especificação da tabela e coluna no formato `"campoApiTabela:nmColunaTemplate"`
- **nome**: Nome exibido para o usuário

### 3. Propriedades Opcionais
- **mask**: Máscara para formatação do resultado (brl, usd, numero_decimal, numero_inteiro)
- **campoApi**: Identificador único do campo
- **obrigatorio**: Se o campo é obrigatório

## Funcionalidades

### Validações Automáticas
- Identifica a tabela específica pelo campoApi
- Valida se a coluna especificada existe na tabela
- Verifica se a coluna pode ser calculada (tipo number ou text com máscaras válidas)
- Trata valores inválidos e exibe mensagens de erro descritivas

### Máscaras Suportadas
- **brl**: Formatação de moeda brasileira (R$ 1.234,56)
- **usd**: Formatação de moeda americana ($1,234.56)
- **numero_decimal**: Número decimal (1.234,56)
- **numero_inteiro**: Número inteiro (1.234)

### Processo de Cálculo
1. Identifica a tabela específica pelo campoApi
2. Localiza a coluna especificada pelo `nmColunaTemplate`
3. Valida se a coluna pode ser calculada
4. Remove máscaras dos valores se necessário
5. Converte para números e soma todos os valores
6. Aplica a máscara apropriada no resultado final

## Exemplo de Uso

### Tabela de Funcionários
```json
{
  "type": "tabela",
  "nome": "Funcionários",
  "campoApi": "funcionarios",
  "colunas": [
    {
      "type": "text",
      "nome": "Nome",
      "nmColunaTemplate": "nome"
    },
    {
      "type": "text",
      "nome": "Cargo",
      "nmColunaTemplate": "cargo"
    },
    {
      "type": "text",
      "nome": "Salário",
      "nmColunaTemplate": "salario",
      "mask": "brl"
    }
  ],
  "conteudo": "[{\"nmColumn\":\"Nome\",\"nmColunaTemplate\":\"nome\",\"rows\":[\"João\",\"Maria\",\"Pedro\",\"Ana\",\"Carlos\"]},{\"nmColumn\":\"Cargo\",\"nmColunaTemplate\":\"cargo\",\"rows\":[\"Desenvolvedor\",\"Designer\",\"Analista\",\"Gerente\",\"Estagiário\"]},{\"nmColumn\":\"Salário\",\"nmColunaTemplate\":\"salario\",\"rows\":[\"R$ 3.500,00\",\"R$ 4.200,00\",\"R$ 2.800,00\",\"R$ 5.500,00\",\"R$ 0,00\"]}]"
}
```

### Campo de Cálculo
```json
{
  "type": "calcula_coluna_tabela",
  "findTableColunaTemplate": "funcionarios:salario",
  "nome": "Total de Salários",
  "mask": "brl",
  "campoApi": "total_salarios"
}
```

### Resultado
O campo calculará automaticamente: R$ 3.500,00 + R$ 4.200,00 + R$ 2.800,00 + R$ 5.500,00 + R$ 0,00 = **R$ 16.000,00**

**Nota**: Valores "0" são tratados como válidos e incluídos no cálculo normalmente.

## Tratamento de Erros

### Mensagens de Erro Comuns
- "Especificação da coluna não encontrada"
- "Formato inválido para findTableColunaTemplate. Use: 'campoApiTabela:nmColunaTemplate'"
- "Tabela com campoApi 'X' não encontrada"
- "Nenhum dado encontrado na tabela"
- "Coluna 'X' não encontrada na tabela"
- "Coluna 'X' não pode ser calculada. Verifique se é do tipo número ou tem máscara válida."
- "Erro: O conteúdo da linha Y da coluna 'X' não pode ser calculado. Verifique se o valor é numérico."

### Comportamento em Caso de Erro
- O campo retorna "0" como valor padrão
- Exibe toast de erro com descrição detalhada
- Logs detalhados no console (apenas em desenvolvimento)

## Integração

O campo está integrado ao `GenericField` e será renderizado automaticamente quando o tipo for `"calcula_coluna_tabela"`.

```typescript
{field.type === "calcula_coluna_tabela" && (
  <CalculaColunaTabelaField 
    field={field} 
    restFields={restFields} 
    onValueChange={setValue} 
  />
)}
```

## Logs de Desenvolvimento

O componente utiliza `dev_log()` para logs apenas em ambiente de desenvolvimento:
- Campo tabela encontrado
- Coluna identificada
- Valores sendo processados
- Resultado final

## Casos de Uso Típicos

1. **Cálculo de salários**: Somar coluna "salario" de uma tabela de funcionários
2. **Total de vendas**: Somar coluna "valor" de uma tabela de vendas
3. **Soma de despesas**: Somar coluna "valor" de uma tabela de despesas
4. **Total de horas**: Somar coluna "horas" de uma tabela de projetos 