import Container from "../Container";

export default function Header() {
  return (
    <header className="w-full flex flex-row justify-center items-center bg-blue-900 text-white py-2">
      <Container className="flex items-center justify-between">
        <div className="w-[150px] h-12 rounded-md bg-blue-100"></div>
      </Container>
    </header>
  );
}
