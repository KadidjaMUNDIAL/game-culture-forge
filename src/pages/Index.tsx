import { PublicLayout } from "@/components/site/PublicLayout";
import { EditablePage } from "@/components/site/EditablePage";

const Index = () => (
  <PublicLayout>
    <EditablePage slug="inicio" titulo="Início">
      <h2 className="font-display text-3xl md:text-5xl text-center uppercase text-navy mb-8">
        Bem-vindo(a)!
      </h2>

      <section className="mb-12">
        <h3 className="section-title mb-4">Apresentação</h3>
        <article className="pixel-card">
          <p className="font-body text-justify leading-relaxed text-base md:text-lg text-foreground">
            A disciplina <strong>Itinerário Formativo - Jogos, Cultura e Sociedade</strong> convida os
            estudantes a compreenderem os jogos para além do entretenimento e lazer, reconhecendo-os como
            manifestações culturais, históricas, sociais e educativas que acompanham a humanidade desde a
            Antiguidade. Mais do que estudar jogos, esta disciplina propõe compreender o papel do lúdico
            na formação da cultura, da sociedade e da própria vida humana.
          </p>
        </article>
      </section>

      <section className="mb-12">
        <h3 className="section-title mb-4">Objetivos</h3>
        <article className="pixel-card">
          <ul className="space-y-3 font-body text-base md:text-lg">
            {[
              "Compreender o conceito de jogo a partir de diferentes perspectivas teóricas.",
              "Identificar as relações entre jogos, cultura, tecnologia e organização social.",
              "Relacionar o universo dos jogos com a realidade social dos estudantes, compreendendo o impacto da cultura gamer e da sociedade gamificada.",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1 inline-block w-3 h-3 bg-pixelyellow shrink-0" style={{ clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </EditablePage>
  </PublicLayout>
);

export default Index;
