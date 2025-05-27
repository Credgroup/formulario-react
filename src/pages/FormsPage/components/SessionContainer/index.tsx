import type { FieldType, SessaoType } from "@/types";
import GenericField from "../GenericField";
import { v4 as uuidv4 } from "uuid";
import SessionDisplayContainer from "../SessionDisplayContainer";

type SessionContainerProps = {
  fields: Partial<FieldType>[];
  error?: string | null;
  isInputType?: boolean;
  resumeSessions?: Partial<SessaoType>[] | null;
  handleSelectSessao?: (session: Partial<SessaoType>) => void;
};
export default function SessionContainer({
  fields,
  error,
  isInputType = true,
  resumeSessions,
  handleSelectSessao,
}: Readonly<SessionContainerProps>) {
  if (!isInputType) {
    return (
      <div className="w-full">
        {resumeSessions?.map(
          (item) =>
            item.isInputType && (
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
        {fields.map((campo) => (
          <GenericField field={campo} key={uuidv4()} restFields={fields} />
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
