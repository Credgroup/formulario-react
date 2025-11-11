import FormNavItem from "../FormNavItem";
import type { SessaoType } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { useSidebarContext } from "@/context/SidebarContext";

type NavContainerProps = {
  navItems: Partial<SessaoType>[];
};
export default function NavContainer({
  navItems,
}: Readonly<NavContainerProps>) {
  const { scrollContainerRef, scrollToActiveItem } = useSidebarContext();

  const handleItemClick = (index: number) => {
    // Pequeno delay para garantir que o DOM foi atualizado
    setTimeout(() => {
      scrollToActiveItem(index);
    }, 50);
  };

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
        <div 
        ref={scrollContainerRef}
        className="relative flex flex-col gap-4 overflow-y-scroll h-[90vh] pr-4"
        style={{ scrollbarWidth: 'none' }}
        >
          {navItems &&
            navItems.length > 0 &&
            navItems.map((sessao, index) => (
              <FormNavItem
                key={`${sessao.title}-${index}`}
                checked={sessao.checked}
                title={sessao.title}
                description={sessao.descricao}
                disable={sessao.disabled}
                active={sessao.active}
                className={cn(
                  "w-full max-w-[300px] sm:max-w-none break-words",
                  navItems.length > 5 &&
                    index === navItems.length - 1 &&
                    "mb-24"
                )}
                onClick={() => handleItemClick(index)}
                index={index}
              />
            ))}
        </div>
          {navItems.length > 5 && (
            <div className="absolute w-full h-24 bg-gradient-to-t from-background bottom-0"></div>
          )}
      </div>
    </>
  );
}
