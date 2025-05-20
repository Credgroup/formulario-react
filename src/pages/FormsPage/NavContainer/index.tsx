import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import FormNavItem from "../components/FormNavItem";
import type { SessaoType } from "@/types";

type NavContainerProps = {
  navItems: Partial<SessaoType>[];
};
export default function NavContainer({
  navItems,
}: Readonly<NavContainerProps>) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) {
      return;
    }
  }, [api]);

  return (
    <>
      <Carousel className="flex sm:hidden w-full flex-wrap" setApi={setApi}>
        <CarouselContent className="">
          {navItems &&
            navItems.length > 0 &&
            navItems.map((sessao, index) => (
              <CarouselItem className="w-full" key={index}>
                <FormNavItem
                  checked={sessao.checked}
                  title={sessao.title}
                  description={sessao.descricao}
                  disable={sessao.disabled}
                  active={sessao.active}
                  className="w-full"
                />
              </CarouselItem>
            ))}
        </CarouselContent>
      </Carousel>
      <div className="hidden sm:block">
        {navItems &&
          navItems.length > 0 &&
          navItems.map((sessao, index) => (
            <FormNavItem
              key={index}
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
