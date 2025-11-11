# 📋 Plano de Atualização - Formulário React

## 🎯 Objetivo
Migrar a estrutura atual do formulário (que usa `field.conteudo = 'valor'` - antipattern) para uma arquitetura React saudável usando `useMemo`, `useCallback` e gerenciamento de estado adequado, além de implementar o novo campo API.

---

## 📊 Análise da Situação Atual

### **Problema Principal**
- **Antipattern**: `field.conteudo = 'valor'` - mutação direta de props/state
- **Estrutura atual**: `src/pages/FormsPage/` (antipattern)
- **Estrutura nova**: `otherAppComponents/Vendas/ProductFormPage/` (padrão correto)

### **Diferenças Identificadas**
1. **GenericField atual** (src): Usa `field.conteudo = value` diretamente
2. **GenericField novo** (otherApp): Usa `useState`, `useCallback`, `memo` e callbacks
3. **Context de Scroll**: Já existe e funciona (SidebarContext)
4. **Campo API**: Existe na nova estrutura, precisa ser implementado

---

## 🚀 Plano de Implementação

### **FASE 1: Preparação e Análise** ⏱️ ~30min

#### 1.1 Criar o hook useFieldApi
- **Arquivo**: `src/hooks/useFieldApi.ts`
- **Baseado em**: `otherAppComponents/useFieldApi.ts` (implementação real)
- **Funcionalidades**:
  - Cache de respostas da API (`apiCacheRef`)
  - Controle de loading por campo (`loadingFieldsRef`)
  - Suporte especial para ViaCEP (`field.apiConfig.type === 'cep'`)
  - Suporte para APIs customizadas (`field.apiConfig.url`)
  - Atualização de campos alvo via callback (`updateTargetFields`)
  - Tratamento de erros com toast

#### 1.2 Analisar diferenças entre estruturas
- **Comparar**: GenericField antigo vs novo
- **Identificar**: Padrões de uso de `useMemo`, `useCallback`, `memo`
- **Mapear**: Callbacks e props necessárias
- **Analisar**: Integração com `ApiFieldWrapper` para indicadores visuais

### **FASE 2: Atualização do GenericField** ⏱️ ~1h

#### 2.1 Migrar src/pages/FormsPage/components/GenericField/index.tsx
- **Remover**: `field.conteudo = value` (antipattern)
- **Adicionar**: `useState` para gerenciar valor local
- **Implementar**: `useCallback` para handlers
- **Adicionar**: `memo` para otimização
- **Implementar**: Sincronização bidirecional com callbacks
- **Adicionar**: Suporte ao campo API com `useFieldApi`
- **Implementar**: Estados de API (`apiStatus`, `apiErrorMessage`)
- **Adicionar**: Debounce para chamadas de API (500ms)
- **Integrar**: `ApiFieldWrapper` para indicadores visuais

#### 2.2 Atualizar props e interfaces
- **Adicionar**: `onFieldUpdate?: (targetName: string, newValue: string) => void`
- **Manter**: Compatibilidade com estrutura existente
- **Implementar**: Lógica de debounce para API calls
- **Adicionar**: Suporte a `field.apiConfig` com:
  - `type: 'cep'` para ViaCEP
  - `url` para APIs customizadas
  - `targetFields` para campos alvo
  - `method` para método HTTP

### **FASE 3: Atualização do SessionContainer** ⏱️ ~30min

#### 3.1 Migrar src/pages/FormsPage/components/SessionContainer/index.tsx
- **Adicionar**: `useMemo` para otimizar renderização
- **Implementar**: `useCallback` para handlers
- **Adicionar**: Suporte ao `onFieldUpdate` callback
- **Manter**: Funcionalidade existente

### **FASE 4: Atualização do Hook Principal** ⏱️ ~45min

#### 4.1 Migrar src/pages/FormsPage/useFormPageHook.ts
- **Adicionar**: Funções `updateFieldValue` e `updateNormalField`
- **Implementar**: `useCallback` para todas as funções
- **Adicionar**: Lógica de sincronização de campos
- **Manter**: Toda funcionalidade existente
- **Adicionar**: Suporte ao campo API

#### 4.2 Integrar com Context de Scroll
- **Verificar**: Se SidebarContext está sendo usado
- **Adaptar**: Para funcionar com menu vertical (não horizontal)
- **Manter**: Funcionalidade de scroll automático

### **FASE 5: Implementação do Campo API** ⏱️ ~1h

#### 5.1 Criar componentes necessários
- **Arquivo**: `src/pages/FormsPage/components/ApiFieldWrapper/index.tsx`
- **Baseado em**: `otherAppComponents/Vendas/ProductFormPage/components/ApiFieldWrapper/index.tsx`
- **Funcionalidades**:
  - Indicadores visuais (loading, success, error)
  - Ícones: `Loader2`, `Check`, `AlertCircle`
  - Mensagem de erro abaixo do campo
  - Posicionamento absoluto dos indicadores

#### 5.2 Implementar lógica do campo API
- **Adicionar**: Suporte a `field.apiConfig` no GenericField
- **Implementar**: Debounce para chamadas de API (500ms)
- **Adicionar**: Estados de API (`apiStatus`, `apiErrorMessage`)
- **Implementar**: Atualização automática de outros campos via `onFieldUpdate`
- **Integrar**: Cache de respostas para evitar chamadas desnecessárias

#### 5.3 Integrar com useFieldApi
- **Conectar**: GenericField com `useFieldApi`
- **Implementar**: Callback `onFieldUpdate` para atualizar campos relacionados
- **Adicionar**: Tratamento de erros com toast
- **Implementar**: Controle de loading por campo
- **Adicionar**: Suporte especial para ViaCEP e APIs customizadas

### **FASE 6: Testes e Validação** ⏱️ ~30min

#### 6.1 Testar funcionalidades existentes
- **Verificar**: Todos os tipos de campo funcionam
- **Testar**: Navegação entre sessões
- **Validar**: Validações e envio de dados
- **Confirmar**: Scroll automático funciona

#### 6.2 Testar nova funcionalidade
- **Testar**: Campo API com ViaCEP (tipo 'cep')
- **Testar**: Campo API com URL customizada
- **Validar**: Atualização de campos relacionados via `targetFields`
- **Verificar**: Estados de loading, success e error
- **Confirmar**: Debounce funciona corretamente (500ms)
- **Testar**: Cache de respostas da API
- **Validar**: Indicadores visuais do `ApiFieldWrapper`
- **Verificar**: Toast de sucesso e erro

### **FASE 7: Limpeza e Documentação** ⏱️ ~15min

#### 7.1 Limpeza de código
- **Remover**: Código comentado desnecessário
- **Organizar**: Imports e exports
- **Verificar**: Consistência de nomenclatura

#### 7.2 Documentação
- **Atualizar**: Comentários no código
- **Documentar**: Novas funcionalidades
- **Criar**: Exemplos de uso do campo API

---

## 🔧 Implementação Detalhada do useFieldApi

### **Estrutura do Hook useFieldApi**

Baseado na implementação real em `otherAppComponents/useFieldApi.ts`:

```typescript
export const useFieldApi = () => {
  // Cache de respostas da API
  const apiCacheRef = useRef<Record<string, any>>({});
  
  // Controle de loading por campo
  const loadingFieldsRef = useRef<Set<string>>(new Set());
  const [loadingFieldsArray, setLoadingFieldsArray] = useState<string[]>([]);

  // Função para atualizar campos alvo
  const updateTargetFields = useCallback((
    targetFields: { targetName: string; apiResponseKey: string }[],
    response: any,
    allFields: Partial<FieldType>[],
    onFieldUpdate: (targetName: string, newValue: string) => void
  ) => {
    targetFields.forEach(({ targetName, apiResponseKey }) => {
      const newValue = response[apiResponseKey];
      if (newValue) {
        onFieldUpdate(targetName, newValue);
      }
    });
  }, []);

  // Função principal que chama a API
  const callFieldApi = useCallback(async (
    field: Partial<FieldType>, 
    value: string, 
    allFields: Partial<FieldType>[],
    onFieldUpdate: (targetName: string, newValue: string) => void
  ) => {
    // Implementação com cache, loading e suporte a ViaCEP
  }, [updateTargetFields]);

  return { 
    callFieldApi, 
    updateTargetFields, 
    loadingFields: loadingFieldsArray 
  };
};
```

### **Suporte Especial para ViaCEP**

```typescript
if (field.apiConfig.type === 'cep') {
  const cleanCep = value.replace(/\D/g, '');
  const apiResponse = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
  const data = await apiResponse.json();
  
  if (data.erro) {
    throw new Error('CEP não encontrado');
  }
  
  response = data;
}
```

### **Suporte para APIs Customizadas**

```typescript
else if (field.apiConfig.url) {
  response = await execApi({
    url: field.apiConfig.url,
    method: field.apiConfig.method || 'GET',
    data: { value },
    isCrmApi: true,
  });
}
```

---

## 📝 Detalhes Técnicos

### **Padrões a Implementar**

#### 1. Gerenciamento de Estado
```typescript
// ❌ Antipattern (atual)
field.conteudo = value;

// ✅ Padrão correto (novo)
const [value, setValue] = useState(field.conteudo ?? "");
const handleValueChange = useCallback((newValue: string) => {
  setValue(newValue);
  onValueChange?.(newValue);
}, [onValueChange]);
```

#### 2. Otimização com Memo
```typescript
// ✅ Componente memoizado
export default memo(GenericField, (prevProps, nextProps) => {
  return (
    prevProps.field.conteudo === nextProps.field.conteudo &&
    // ... outras comparações
  );
});
```

#### 3. Callbacks Otimizados
```typescript
// ✅ Callbacks memoizados
const updateFieldValue = useCallback((targetName: string, newValue: string) => {
  // Lógica de atualização
}, []);

// ✅ Hook useFieldApi com cache e loading
const { callFieldApi, loadingFields } = useFieldApi();
```

#### 4. Campo API com ViaCEP
```typescript
// ✅ Configuração para ViaCEP
field.apiConfig = {
  type: 'cep',
  targetFields: [
    { targetName: 'logradouro', apiResponseKey: 'logradouro' },
    { targetName: 'bairro', apiResponseKey: 'bairro' },
    { targetName: 'cidade', apiResponseKey: 'localidade' },
    { targetName: 'estado', apiResponseKey: 'uf' }
  ]
};

// ✅ Configuração para API customizada
field.apiConfig = {
  url: 'api/custom/endpoint',
  method: 'POST',
  targetFields: [
    { targetName: 'campo_alvo', apiResponseKey: 'response_key' }
  ]
};
```

### **Estrutura de Arquivos a Modificar**

```
src/
├── hooks/
│   └── useFieldApi.ts                    # 🆕 Criar
├── pages/FormsPage/
│   ├── components/
│   │   ├── GenericField/
│   │   │   └── index.tsx                 # 🔄 Atualizar
│   │   ├── SessionContainer/
│   │   │   └── index.tsx                 # 🔄 Atualizar
│   │   └── ApiFieldWrapper/              # 🆕 Criar
│   │       └── index.tsx
│   └── useFormPageHook.ts                # 🔄 Atualizar
```

### **Dependências e Imports**

#### Novos imports necessários:
```typescript
import { useCallback, useMemo, memo, useRef } from 'react';
import { useFieldApi } from '@/hooks/useFieldApi';
import { ApiFieldWrapper } from '../ApiFieldWrapper';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
```

#### Props a adicionar:
```typescript
type GenericFieldProps = {
  field: Partial<FieldType>;
  restFields: Partial<FieldType>[];
  onValueChange?: (value: any) => void;
  onFieldUpdate?: (targetName: string, newValue: string) => void; // 🆕
};

// 🆕 Interface para configuração de API
interface ApiConfig {
  type?: 'cep' | 'custom';
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  targetFields: {
    targetName: string;
    apiResponseKey: string;
  }[];
}

// 🆕 Extensão do FieldType para suportar API
interface FieldTypeWithApi extends FieldType {
  apiConfig?: ApiConfig;
  target?: string; // Para campos que são alvos de API
}
```

---

## ⚠️ Pontos de Atenção

### **Compatibilidade**
- **Manter**: Toda funcionalidade existente
- **Não quebrar**: Navegação entre sessões
- **Preservar**: Validações e envio de dados
- **Manter**: Scroll automático do menu

### **Performance**
- **Implementar**: Memoização adequada
- **Evitar**: Re-renders desnecessários
- **Otimizar**: Callbacks com useCallback
- **Debounce**: Chamadas de API

### **Context de Scroll**
- **Manter**: Menu vertical (não horizontal)
- **Preservar**: Funcionalidade de scroll automático
- **Adaptar**: Apenas a lógica, não os estilos

---

## 🎯 Resultado Esperado

### **Antes da Atualização**
- ❌ `field.conteudo = 'valor'` (antipattern)
- ❌ Re-renders desnecessários
- ❌ Sem suporte a campo API
- ❌ Código não otimizado

### **Após a Atualização**
- ✅ Gerenciamento de estado React adequado
- ✅ Componentes memoizados e otimizados
- ✅ Campo API funcionando
- ✅ Scroll automático mantido
- ✅ Toda funcionalidade existente preservada
- ✅ Código mais limpo e manutenível

---

## 📋 Checklist de Validação

### **Funcionalidades Básicas**
- [ ] Todos os tipos de campo funcionam
- [ ] Navegação entre sessões funciona
- [ ] Validações funcionam
- [ ] Envio de dados funciona
- [ ] Scroll automático funciona

### **Novas Funcionalidades**
- [ ] Campo API com ViaCEP funciona
- [ ] Campo API com URL customizada funciona
- [ ] Atualização de campos relacionados via `targetFields` funciona
- [ ] Estados de loading/success/error funcionam
- [ ] Debounce de 500ms funciona
- [ ] Cache de respostas da API funciona
- [ ] Indicadores visuais do `ApiFieldWrapper` funcionam
- [ ] Toast de sucesso e erro funcionam

### **Performance**
- [ ] Componentes memoizados
- [ ] Callbacks otimizados
- [ ] Sem re-renders desnecessários
- [ ] Código limpo e organizado

---

*Documento criado em: [DATA]*
*Versão: 1.0*
*Tempo estimado total: ~4h*
