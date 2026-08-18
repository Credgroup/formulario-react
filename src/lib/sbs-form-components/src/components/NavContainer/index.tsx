import {FormNavItem} from "../FormNavItem";
import type { SessaoType } from "../../core/types";
import { cn } from "../../utils";
import { useSidebarContext } from "../../context/SidebarContext";

type NavContainerProps = {
  navItems: Partial<SessaoType>[];
  orientation?: "horizontal" | "vertical"
};
export function NavContainer({
  navItems,
  orientation = "vertical"
}: Readonly<NavContainerProps>) {
  const { scrollContainerRef, scrollToActiveItem } = useSidebarContext();

  const handleItemClick = (index: number) => {
    // Pequeno delay para garantir que o DOM foi atualizado
    setTimeout(() => {
      scrollToActiveItem(index);
    }, 50);
  };

  if(orientation == "vertical"){
    return (
      <>
        <div 
          ref={scrollContainerRef}
          className="w-full relative flex flex-col gap-4 overflow-y-scroll pr-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {navItems &&
            navItems.length > 0 &&
            navItems.map((sessao, index) => (
              <FormNavItem
                key={sessao.id}
                checked={sessao.checked}
                title={sessao.title}
                description={sessao.descricao}
                disable={sessao.disabled}
                active={sessao.active}
                className={cn(
                  "w-full max-w-75 sm:max-w-none wrap-break-word",
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
          <div className="absolute w-full h-24 from-background bottom-0"></div>
        )}
      </>
    );
  }

  return (
    <div 
      ref={scrollContainerRef}
      className="flex flex-row gap-4 p-4 px-6 overflow-x-scroll scrollbar-none" 
      style={{ scrollbarWidth: 'none' }}
    >
      {navItems &&
        navItems.length > 0 &&
        navItems.map((sessao, index) => (
          <FormNavItem
            key={sessao.id}
            checked={sessao.checked}
            title={sessao.title}
            description={sessao.descricao}
            disable={sessao.disabled}
            active={sessao.active}
            className={cn(
              "min-w-50 max-w-87.5 shrink-0"
            )}
            steps={navItems}
            onClick={() => handleItemClick(index)}
            index={index}
          />
        ))}
    </div>
  );
}
