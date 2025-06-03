import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SessaoType } from "@/types";
import { useEffect, useState } from "react";
import { LuCheck } from "react-icons/lu";
type FormNavItemProps = {
  disable?: boolean;
  checked?: boolean;
  title?: string;
  description?: string;
  active?: boolean;
  className?: string;
  steps?: Partial<SessaoType>[];
};
export default function FormNavItem({
  checked,
  description,
  disable,
  title,
  active,
  className,
  steps,
}: Readonly<FormNavItemProps>) {
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

  function findIndexOfActiveStep(steps: Partial<SessaoType>[]) {
    if (!steps || steps.length === 0) return -1;
    return steps.findIndex((step) => step.active);
  }

  useEffect(() => {
    if (steps && steps.length > 0) {
      setActiveStepIndex(findIndexOfActiveStep(steps));
    }
  }, []);

  return (
    <div
      className={cn(
        "space-y-1 py-2 transition-all select-none",
        className,
        disable && "opacity-30"
      )}
    >
      <div className="flex flex-col gap-2">
        {!steps && active && (
          <div
            className={cn(
              "flex justify-center items-center w-7 h-7 rounded-full border-4 border-[var(--menu-item-step-bg)]"
            )}
          ></div>
        )}
        {!steps && !active && !checked && (
          <div
            className={cn(
              "flex justify-center items-center w-7 h-7 rounded-full border-4 border-zinc-300"
            )}
          ></div>
        )}
        {!steps && checked && !active && (
          <div
            className={cn(
              "flex justify-center items-center w-7 h-7 rounded-full bg-green-500"
            )}
          >
            <LuCheck className="text-xl stroke-4 text-white" />
          </div>
        )}
        {steps && steps.length > 0 && activeStepIndex !== -1 && (
          <Badge className="rounded-full bg-[var(--menu-item-step-bg)] text-[var(--menu-item-step-text)]">
            Sessão {activeStepIndex + 1} de {steps.length}
          </Badge>
        )}
      </div>

      <h1 className="text-2xl font-bold">{title ?? "--"}</h1>
      <p className="text-base font-regular">{description ?? "--"}</p>
    </div>
  );
}
