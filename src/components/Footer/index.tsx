import Container from "../Container";

export default function Footer() {
  const version = import.meta.env.VITE_IMAGE_VERSION;
  const enterpriseName = import.meta.env.VITE_ENTERPRISE_NAME;
  const LOGO_MAP: Record<string, string> = {
    marsh: "logo_white",
    sompo: "extended-logo-dark",
  };

  const logoName = LOGO_MAP[enterpriseName] ?? "logo_white";

  return (
    <footer className="w-full flex justify-center items-center flex-col bg-[var(--footer-container-top)]">
      <Container className="w-full flex flex-col md:flex-row gap-y-4 md:gap-y-0 md:justify-between items-center text-[var(--footer-top-text)] py-10">
        <div className="">
          <img
            src={`https://wkfkeepinsmarsh.blob.core.windows.net/themescss/${enterpriseName}/${logoName}.png`}
            alt="logo"
            className="h-8 md:h-10 mb-1"
          />
          <span className="capitalize">
            copyright {new Date().getFullYear()} | {enterpriseName}
          </span>
        </div>
      </Container>
      <div className="w-full h-6 bg-[var(--footer-container-bottom)] text-center text-zinc-700">
        {version}
      </div>
    </footer>
  );
}
