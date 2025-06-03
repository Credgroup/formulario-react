import Container from "../Container";

export default function Header() {
  return (
    <header className="w-full flex flex-row justify-center items-center bg-[var(--header-container-top)] text-[var(--header-text)] py-2">
      <Container className="flex items-center justify-between">
        <img
          src="https://wkfkeepinsmarsh.blob.core.windows.net/themescss/marsh/logo_white.png"
          alt="logo"
          className="h-8 md:h-10"
        />
      </Container>
    </header>
  );
}
