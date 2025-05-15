import Container from "@/components/Container";
import { useLayoutStore } from "@/stores/useLayoutStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GenericField from "./components/GenericField";
import FormNavItem from "./components/FormNavItem";
import type { FieldType } from "@/types";
import { Button } from "@/components/ui/button";

export default function FormsPage() {
  const layoutObj = useLayoutStore((state) => state.layoutObject);
  const navigate = useNavigate();
  const [siderbar, setSidebar] = useState<any>([]);
  useEffect(() => {
    if (!layoutObj || layoutObj.length === 0) {
      navigate("/");
      return;
    }

    const camposPorSessao = layoutObj.reduce(
      (acc, campo) => {
        const sessao = campo.sessao?.trim() || "Outros Campos";

        if (!acc[sessao]) {
          acc[sessao] = {
            titulo: campo.titulo || sessao,
            descricao: campo.descricao || "",
            campos: [],
          };
        }

        acc[sessao].campos.push(campo);

        return acc;
      },
      {} as Record<
        string,
        {
          titulo: string;
          descricao: string;
          campos: Partial<FieldType>[];
        }
      >
    );

    const sessoesArray = Object.entries(camposPorSessao).map(
      ([sessao, data]) => ({
        sessao,
        titulo: data.titulo,
        descricao: data.descricao,
        campos: data.campos,
      })
    );

    const sidebarItems = sessoesArray.map((sessao) => ({
      title: sessao.sessao,
      checked: false,
      disabled: true,
    }));

    setSidebar(sidebarItems);
    console.log(siderbar);
  }, []);

  return (
    <Container className="py-10">
      <div className="flex justify-center items-start gap-10">
        <div className="w-full max-w-1/3 space-y-4">
          <FormNavItem
            checked={true}
            title="(em construcao)"
            description="(em construcao)"
            disable={true}
          />
        </div>
        <div className="w-full max-w-2/3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          {layoutObj?.map((item, index) => (
            <GenericField field={item} key={index} />
          ))}
          <Button className="block">Em construcao...</Button>
        </div>
      </div>
    </Container>
  );
}
