import Container from "../Container";

export default function Footer() {
  const version = import.meta.env.VITE_IMAGE_VERSION;
  const hasLinks = false;

  const links = {
    social: [
      {
        name: "Facebook",
        url: "https://www.facebook.com",
      },
      {
        name: "Instagram",
        url: "https://www.instagram.com",
      },
      {
        name: "Twitter",
        url: "https://www.twitter.com",
      },
    ],
    uteis: [
      {
        name: "Primeiro link",
        url: "https://www.link1.com",
      },
      {
        name: "Segundo link",
        url: "https://www.link2.com",
      },
      {
        name: "Terceiro link",
        url: "https://www.link3.com",
      },
    ],
  };

  return (
    <footer className="w-full flex justify-center items-center flex-col bg-zinc-800">
      <Container className="w-full flex flex-col md:flex-row gap-y-4 md:gap-y-0 md:justify-between items-center text-gray-500 py-10">
        <div className="">
          <img
            src="https://wkfkeepinsmarsh.blob.core.windows.net/themescss/marsh/logo_white.png"
            alt="logo"
            className="h-8 md:h-10 mb-1"
          />
          <span>copyright 2024 | Marsh</span>
        </div>

        <nav className="links h-full flex flex-col gap-y-3 sm:gap-y-0 sm:flex-row w-full max-w-1/2">
          {hasLinks && (
            <>
              <ul className="w-full max-w-[300px] flex flex-col items-center md:items-end h-full">
                {links.social.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    {link.name}
                  </a>
                ))}
              </ul>
              <ul className="w-full max-w-[300px] flex flex-col items-center md:items-end h-full">
                {links.uteis.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    {link.name}
                  </a>
                ))}
              </ul>
            </>
          )}
        </nav>
      </Container>
      <div className="w-full h-6 bg-zinc-900 text-center text-zinc-700">
        {version}
      </div>
    </footer>
  );
}
