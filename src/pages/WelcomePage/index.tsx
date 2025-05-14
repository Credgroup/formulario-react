import { LuArrowRight } from "react-icons/lu";
import Container from "../../components/Container";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

export default function WelcomePage() {
  const infos = {
    nome: "Itamar",
    produtos: ["Produto 1", "Produto 2", "Produto 3"],
  };
  return (
    <div className="w-full h-full bg-zinc-500 flex items-center justify-center">
      <Container>
        <h1 className="text-3xl font-bold mb-2">Olá, {infos.nome}</h1>
        <p className="text-lg mb-4 w-full max-w-2xl">
          Vemos que você tem interesse em seguros de{" "}
          {infos.produtos.map((item) => (
            <span className="mr-1 font-semibold" key={item}>
              {item}
            </span>
          ))}{" "}
          de alguns parceiros nossos, que tal fazermos uma cotação?
        </p>

        <Button
          asChild
          className="rounded-full cursor-pointer"
          variant="secondary"
        >
          <Link to="/forms" className="flex items-center gap-2">
            Desejo fazer um orçamento
            <LuArrowRight />
          </Link>
        </Button>
      </Container>
    </div>
  );
}
