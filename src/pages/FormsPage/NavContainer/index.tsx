import FormNavItem from "../components/FormNavItem";
import type { SessaoType } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

type NavContainerProps = {
  navItems: Partial<SessaoType>[];
};
export default function NavContainer({
  navItems,
}: Readonly<NavContainerProps>) {
  return (
    <>
      <div className="flex sm:hidden w-full flex-wrap">
        <div className="w-full relative -mb-4">
          {navItems &&
            navItems.length > 0 &&
            navItems.map((sessao) => (
              <div
                className={cn(
                  "w-full opacity-0 transition-all h-0 cursor-none pointer-events-none",
                  sessao.active && "opacity-100 h-fit"
                )}
                key={uuidv4()}
              >
                <FormNavItem
                  checked={sessao.checked}
                  title={sessao.title}
                  description={sessao.descricao}
                  disable={sessao.disabled}
                  active={sessao.active}
                  className="w-full"
                  steps={navItems}
                />
              </div>
            ))}
        </div>
      </div>
      <div className="hidden sm:block">
        {navItems &&
          navItems.length > 0 &&
          navItems.map((sessao) => (
            <FormNavItem
              key={uuidv4()}
              checked={sessao.checked}
              title={sessao.title}
              description={sessao.descricao}
              disable={sessao.disabled}
              active={sessao.active}
              className="w-full max-w-[300px] sm:max-w-none break-words"
            />
          ))}
      </div>
    </>
  );
}
