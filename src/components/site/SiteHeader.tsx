const MASCOT = "https://i.ibb.co/JwMDdxHR/Chat-GPT-Image-14-de-abr-de-2026-20-23-43-crop.png";

export const SiteHeader = () => {
  return (
    <header className="hero-header py-10 md:py-14 px-4">
      <div className="container relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
        <div className="text-center md:text-left">
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold leading-none">
            <span className="block text-white drop-shadow-[3px_3px_0_hsl(var(--navy-deep))]">JOGOS, CULTURA</span>
            <span className="block text-pixelyellow drop-shadow-[3px_3px_0_hsl(var(--navy-deep))]">E SOCIEDADE</span>
          </h1>
          <p className="mt-3 font-ui text-white/85 tracking-wide text-sm md:text-base uppercase">
            Colégio Mundial — 2026
          </p>
        </div>
        <img
          src={MASCOT}
          alt="Mascote da disciplina Jogos, Cultura e Sociedade"
          className="w-32 md:w-44 lg:w-52 h-auto pixel-square rounded-lg"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
    </header>
  );
};
