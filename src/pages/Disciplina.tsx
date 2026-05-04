import { useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { EditablePage } from "@/components/site/EditablePage";
import { ChevronDown, ChevronUp, CalendarDays } from "lucide-react";

const trimestres = [
  {
    titulo: "1º TRIMESTRE",
    unidades: [
      { unidade: "Unidade 01", titulo: "Conceito de Jogo", conteudos: ["Definição de jogo", "Huizinga e o lúdico", "Jogo, cultura e sociedade"] },
      { unidade: "Unidade 02", titulo: "Jogos na Antiguidade", conteudos: ["Jogos olímpicos antigos", "Tabuleiros antigos", "Rituais e jogos"] },
    ],
  },
  {
    titulo: "2º TRIMESTRE",
    unidades: [
      { unidade: "Unidade 03", titulo: "Jogos de Tabuleiro Modernos", conteudos: ["Xadrez", "Go", "Jogos contemporâneos"] },
      { unidade: "Unidade 04", titulo: "Transição para o digital", conteudos: ["Primeiros videogames", "Cultura arcade", "Indústria nascente"] },
    ],
  },
  {
    titulo: "3º TRIMESTRE",
    unidades: [
      { unidade: "Unidade 05", titulo: "Jogos eletrônicos hoje", conteudos: ["Gêneros", "Esports", "Gamificação"] },
      { unidade: "Unidade 06", titulo: "Sociedade Gamificada", conteudos: ["Trabalho e jogo", "Educação gamificada", "Ética e jogos"] },
    ],
  },
];

const Disciplina = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <PublicLayout>
      <EditablePage slug="disciplina" titulo="A Disciplina">
      <h2 className="font-display text-3xl md:text-5xl text-center uppercase text-navy mb-8">A Disciplina</h2>

      <section className="mb-12">
        <h3 className="section-title mb-4">Sobre</h3>
        <article className="pixel-card space-y-4 font-body text-base md:text-lg text-justify leading-relaxed">
          <p>Os jogos sempre fizeram parte do cotidiano das sociedades e foram, inclusive, capazes de interromper guerras durante o mundo grego antigo. Johan Huizinga pontuou que "o jogo é mais antigo do que a cultura". Mas o que nos fascina no jogar e no brincar? Mais do que competir, trata-se da capacidade de se desafiar, vendo os outros não como inimigos, mas como adversários pontuais. Nesse sentido, compreender a presença dos jogos no desenvolvimento das mais variadas culturas e sociedades é entender, também, a forma que homens e mulheres têm encontrado para se divertir.</p>
          <p>Partindo da concepção lúdica do jogar, é necessário articular conhecimento, linguagem, arte e filosofia para se compreender a evolução histórica dos jogos nas mais distintas partes do mundo. Com essas premissas, a proposta deste Itinerário Formativo é compreender as interlocuções dos jogos com diferentes elementos, tais como: guerra, direito, filosofia, esportes, tecnologia etc.</p>
          <p>A proposta, por fim, abordará dois módulos: no primeiro, a compreensão dos jogos antes das novas tecnologias; no segundo, a transição dos jogos de tabuleiros para o predomínio dos jogos eletrônicos contemporâneos em suas distintas formas e possibilidades.</p>
        </article>
      </section>

      <section>
        <h3 className="section-title mb-4">Linha do Tempo</h3>
        <div className="grid md:grid-cols-3 gap-5">
          {trimestres.map((t, i) => (
            <div key={i} className="pixel-card !p-5">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-2 text-left"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-7 h-7 text-pixelred" />
                  <h4 className="font-display text-xl text-navy uppercase">{t.titulo}</h4>
                </div>
                {open === i ? <ChevronUp /> : <ChevronDown />}
              </button>
              {open === i && (
                <div className="mt-4 animate-fade-in">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="bg-navy text-white">
                        <th className="text-left p-2">Unidade</th>
                        <th className="text-left p-2">Título</th>
                        <th className="text-left p-2">Conteúdos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {t.unidades.map((u, j) => (
                        <tr key={j} className="border-b border-border">
                          <td className="p-2 font-ui font-semibold text-navy">{u.unidade}</td>
                          <td className="p-2">{u.titulo}</td>
                          <td className="p-2">
                            <ul className="list-disc list-inside text-muted-foreground">
                              {u.conteudos.map((c, k) => <li key={k}>{c}</li>)}
                            </ul>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      </EditablePage>
    </PublicLayout>
  );
};

export default Disciplina;
