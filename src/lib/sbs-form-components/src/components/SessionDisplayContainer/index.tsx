import type { SessaoType } from "../../core/types";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import { LucidePenLine } from "lucide-react";
import DisplayInput from "@/components/LayoutRender/DisplayInput";

type SessionDisplayContainerProps = {
  resumeSession?: Partial<SessaoType> | null;
  handleSelectSessao?: (session: Partial<SessaoType>) => void;
};

export function SessionDisplayContainer({
  resumeSession,
  handleSelectSessao,
}: Readonly<SessionDisplayContainerProps>) {

  if (resumeSession?.campos?.every((campo) => campo.visual === false)) {
    return null
  }

  return (
    <div className="w-full space-y-6 mb-10">
      <div className="flex justify-start items-center gap-4">
        <h1 className="text-2xl font-semibold">{resumeSession?.title}</h1>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="w-8 h-8 aspect-square cursor-pointer"
              onClick={() => handleSelectSessao?.(resumeSession!)}
            >
              <LucidePenLine />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar</TooltipContent>
        </Tooltip>
      </div>
      {/* Grid de 2 colunas - campos de tabela ocupam 2 colunas automaticamente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        {resumeSession
          ? resumeSession.campos?.map(
            (campo) =>
              campo.type !== "titulo_subtitulo" && (
                <DisplayInput field={campo} key={uuidv4()} />
              )
          )
          : null}
      </div>
    </div>
  );
}
