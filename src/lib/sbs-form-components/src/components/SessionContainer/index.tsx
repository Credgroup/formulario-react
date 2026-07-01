import type { FieldType, SessaoType } from "../../core/types";
import GenericField from "../GenericField";
import { v4 as uuidv4 } from "uuid";
import {SessionDisplayContainer} from "../SessionDisplayContainer";
import { useCallback, useMemo } from "react";

type SessionContainerProps = {
  fields: Partial<FieldType>[];
  error?: string | null;
  typeSession?: "pagamento" | "input" | "documento" | "resumo";
  allSessions?: Partial<SessaoType>[] | null;
  handleSelectSessao?: (session: Partial<SessaoType>) => void;
  updateFieldValue?: (targetName: string, newValue: string) => void;
  updateNormalField?: (campoApi: string, newValue: string) => void;
};
export function SessionContainer({
  fields,
  error,
  typeSession = "input",
  allSessions,
  handleSelectSessao,
  updateFieldValue,
  updateNormalField
}: Readonly<SessionContainerProps>) {
  
  // Memoiza o callback de atualização de campo
  const handleFieldUpdate = useCallback((targetName: string, newValue: string) => {
    console.log(`[SessionContainer] handleFieldUpdate: targetName="${targetName}", newValue="${newValue}"`);
    updateFieldValue?.(targetName, newValue);
  }, [updateFieldValue]);

  // Memoiza o callback de atualização de campo normal
  const handleValueChange = useCallback((campoApi: string, value: any) => {
    updateNormalField?.(campoApi, value);
  }, [updateNormalField]);

  // Memoiza a lista de campos para evitar re-renders desnecessários
  const memoizedFields = useMemo(() => fields, [fields]);

  // Memoiza os callbacks para cada campo para evitar re-criações
  const fieldCallbacks = useMemo(() => {
    return memoizedFields.reduce((acc, campo) => {
      acc[campo.campoApi!] = (value: any) => {
        handleValueChange(campo.campoApi!, value);
      };
      return acc;
    }, {} as Record<string, (value: any) => void>);
  }, [memoizedFields, handleValueChange]);

  if (typeSession == "resumo") {
    return (
      <div className="w-full">
        {allSessions?.map(
          (item) =>
            (item.typeSession === "input" || item.typeSession === "documento") && (
              <SessionDisplayContainer
                key={uuidv4()}
                resumeSession={item}
                handleSelectSessao={handleSelectSessao}
              />
            )
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        {memoizedFields.map((campo) => (
          <GenericField 
            field={campo} 
            key={campo.campoApi || `field-${campo.nome}`} 
            restFields={memoizedFields}
            onValueChange={fieldCallbacks[campo.campoApi!]}
            onFieldUpdate={handleFieldUpdate}
          />
        ))}
      </div>
      {error && (
        <div className="bg-red-500/20 border py-3 px-4 rounded-md border-red-500/20 font-semibold col-span-2 text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
