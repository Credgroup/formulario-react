import { useState, useCallback, useRef } from 'react';
import { type FieldType } from '@/types';
import { execApi } from '@/hooks/useApi';
import { toast } from 'sonner';
import { dev_log } from '@/lib/utils';

export const useFieldApi = () => {
  const apiCacheRef = useRef<Record<string, any>>({});
  const loadingFieldsRef = useRef<Set<string>>(new Set());
  const [loadingFieldsArray, setLoadingFieldsArray] = useState<string[]>([]);

  // Função que atualiza os campos alvo - memoizada
  const updateTargetFields = useCallback((
    targetFields: { targetName: string; apiResponseKey: string }[],
    response: any,
    allFields: Partial<FieldType>[],
    onFieldUpdate: (targetName: string, newValue: string) => void
  ) => {
    dev_log(() => console.log(allFields))
    targetFields.forEach(({ targetName, apiResponseKey }) => {
      const newValue = response[apiResponseKey];
      if (newValue) {
        // Chama a função de callback para notificar a mudança
        // Não modifica diretamente o campo, deixa o callback fazer isso
        onFieldUpdate(targetName, newValue);
      }
    });

  }, []);

  // Função principal que chama a API - memoizada com dependências mínimas
  const callFieldApi = useCallback(async (
    field: Partial<FieldType>, 
    value: string, 
    allFields: Partial<FieldType>[],
    onFieldUpdate: (targetName: string, newValue: string) => void
  ) => {
    if (!field.apiConfig) return Promise.resolve();

    const cacheKey = `${field.campoApi}_${value}`;
    
    // Verifica se já temos cache
    if (apiCacheRef.current[cacheKey]) {
      updateTargetFields(field.apiConfig.targetFields!, apiCacheRef.current[cacheKey], allFields, onFieldUpdate);
      return Promise.resolve();
    }

    // Verifica se já está em loading
    if (loadingFieldsRef.current.has(field.campoApi!)) {
      return Promise.resolve();
    }

    // Adiciona loading
    loadingFieldsRef.current.add(field.campoApi!);
    setLoadingFieldsArray(Array.from(loadingFieldsRef.current));

    try {
      let response;
      
      if (field.apiConfig.type === 'cep') {
        // API de CEP específica - ViaCEP
        const cleanCep = value.replace(/\D/g, '');
        const apiResponse = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await apiResponse.json();
        
        if (data.erro) {
          throw new Error('CEP não encontrado');
        }
        
        response = data;
      } else if (field.apiConfig.url) {
        // API customizada
        response = await execApi({
          url: field.apiConfig.url,
          method: field.apiConfig.method || 'GET',
          data: { value },
        });
      }

      // Salva no cache
      apiCacheRef.current[cacheKey] = response;
      
      // Atualiza os campos alvo
      updateTargetFields(field.apiConfig.targetFields!, response, allFields, onFieldUpdate);
      
      toast.success('Dados preenchidos automaticamente!');
      
    } catch (error) {
      console.error('Erro na API:', error);
      toast.error('Erro ao buscar dados. Verifique o valor informado.');
      throw error; // Re-throw para permitir tratamento no componente
    } finally {
      // Remove loading
      loadingFieldsRef.current.delete(field.campoApi!);
      setLoadingFieldsArray(Array.from(loadingFieldsRef.current));
    }
  }, [updateTargetFields]); // Apenas updateTargetFields como dependência

  return { 
    callFieldApi, 
    updateTargetFields, 
    loadingFields: loadingFieldsArray 
  };
};
