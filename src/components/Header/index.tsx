import Container from "../Container";

export default function Header() {
  const enterpriseName = import.meta.env.VITE_ENTERPRISE_NAME;
  const LOGO_MAP: Record<string, string> = {
    marsh: "logo_white",
    sompo: "extended-logo",
  };

  const logoName = LOGO_MAP[enterpriseName] ?? "logo_white";

  return (
    <header className="w-full flex flex-row justify-center items-center bg-[var(--header-container-top)] text-[var(--header-text)] py-2">
      <Container className="flex items-center justify-between">
        <img
          src={`https://wkfkeepinsmarsh.blob.core.windows.net/themescss/${enterpriseName}/${logoName}.png`}
          alt="logo"
          className="h-8 md:h-10"
        />
      </Container>
    </header>
  );
}
