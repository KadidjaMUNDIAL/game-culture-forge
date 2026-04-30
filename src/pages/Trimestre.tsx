import { useParams, Navigate } from "react-router-dom";
import { PublicLayout } from "@/components/site/PublicLayout";

const dados: Record<string, { avaliacoes: { atividade: string; descricao: string; pontuacao: string }[]; cronograma: { mes: string; itens: { data: string; conteudos: string[]; atividades: string }[] }[] }> = {
  "1": {
    avaliacoes: [
      { atividade: "Prova Trimestral", descricao: "Avaliação sobre conceitos iniciais de jogo e cultura.", pontuacao: "10,0" },
      { atividade: "Trabalho em Grupo", descricao: "Análise de um jogo antigo e seu papel social.", pontuacao: "5,0" },
    ],
    cronograma: [
      { mes: "Fevereiro", itens: [
        { data: "10/02", conteudos: ["Apresentação da disciplina", "O que é jogo?"], atividades: "Leitura inicial." },
        { data: "17/02", conteudos: ["Huizinga e o lúdico"], atividades: "Discussão em sala." },
      ]},
      { mes: "Março", itens: [
        { data: "03/03", conteudos: ["Jogos na Antiguidade"], atividades: "Pesquisa em grupo." },
      ]},
    ],
  },
  "2": { avaliacoes: [], cronograma: [] },
  "3": { avaliacoes: [], cronograma: [] },
};

const Trimestre = () => {
  const { num } = useParams();
  if (!num || !["1", "2", "3"].includes(num)) return <Navigate to="/" />;
  const d = dados[num];

  return (
    <PublicLayout>
      <h2 className="font-display text-3xl md:text-5xl text-center uppercase text-navy mb-8">
        {num}º Trimestre
      </h2>

      <section className="mb-12">
        <h3 className="section-title mb-4">Avaliações</h3>
        <div className="pixel-card overflow-x-auto">
          {d.avaliacoes.length === 0 ? (
            <p className="font-body text-muted-foreground">Nenhuma avaliação cadastrada ainda.</p>
          ) : (
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="text-left p-3">Atividade</th>
                  <th className="text-left p-3">Descrição</th>
                  <th className="text-right p-3 w-32">Pontuação</th>
                </tr>
              </thead>
              <tbody>
                {d.avaliacoes.map((a, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-3 font-ui font-semibold">{a.atividade}</td>
                    <td className="p-3">{a.descricao}</td>
                    <td className="p-3 text-right text-pixelred font-bold">{a.pontuacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <h3 className="section-title mb-4">Cronograma</h3>
        <div className="space-y-5">
          {d.cronograma.length === 0 ? (
            <div className="pixel-card"><p className="font-body text-muted-foreground">Cronograma a definir.</p></div>
          ) : (
            d.cronograma.map((m, i) => (
              <div key={i} className="pixel-card !p-0 overflow-hidden">
                <div className="bg-pixelyellow text-navy font-display text-xl uppercase px-5 py-2">{m.mes}</div>
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-3 w-24">Data</th>
                      <th className="text-left p-3">Conteúdos</th>
                      <th className="text-left p-3">Atividades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.itens.map((it, j) => (
                      <tr key={j} className="border-b border-border">
                        <td className="p-3 font-ui font-semibold text-navy">{it.data}</td>
                        <td className="p-3">
                          <ul className="space-y-1">{it.conteudos.map((c, k) => <li key={k}>{c}</li>)}</ul>
                        </td>
                        <td className="p-3 text-muted-foreground">{it.atividades}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      </section>
    </PublicLayout>
  );
};

export default Trimestre;
