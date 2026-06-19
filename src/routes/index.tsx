import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import trophyImg from "@/assets/trophy.png";
import { Trophy, Crown, Sparkles, Medal } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Copa MRT 2026 — Painel da Competição" },
      { name: "description", content: "Ranking em tempo real das franquias e vendedores do Grupo MRT. Cada venda é um gol." },
    ],
  }),
  component: Index,
});

type Row = { id: string; name: string; points: number };

const QUOTES = [
  "Quem vende mais levanta a taça.",
  "Cada venda é um gol.",
  "Sua próxima venda pode mudar a classificação.",
  "Grandes campeões são construídos todos os dias.",
  "Na Copa MRT, cada ponto vale ouro.",
  "Seu time joga para vencer.",
  "Toda venda aproxima sua franquia do título.",
];

function useRanking(table: "franchises" | "sellers") {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase.from(table).select("id,name,points").order("points", { ascending: false });
      if (active && data) setRows(data as Row[]);
    };
    load();
    const channel = supabase
      .channel(`rt-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => load())
      .subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [table]);
  return rows;
}

function useCampaign() {
  const [prize, setPrize] = useState("Troféu Copa MRT 2026");
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("campaign_info").select("prize").eq("id", 1).maybeSingle();
      if (data?.prize) setPrize(data.prize);
    };
    load();
    const ch = supabase.channel("rt-campaign")
      .on("postgres_changes", { event: "*", schema: "public", table: "campaign_info" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return prize;
}

function RankBadge({ pos }: { pos: number }) {
  if (pos === 1) return <Crown className="h-5 w-5" style={{ color: "var(--gold)" }} />;
  if (pos === 2) return <Medal className="h-5 w-5" style={{ color: "var(--silver)" }} />;
  if (pos === 3) return <Medal className="h-5 w-5" style={{ color: "var(--bronze)" }} />;
  return <span className="text-muted-foreground text-sm">{pos}</span>;
}

function rowClass(pos: number) {
  if (pos === 1) return "row-gold";
  if (pos === 2) return "row-silver";
  if (pos === 3) return "row-bronze";
  return "";
}

function RankTable({ title, icon, rows, label }: { title: string; icon: string; rows: Row[]; label: string }) {
  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    const top = rows[0]?.id ?? null;
    if (top && top !== leaderId) {
      if (leaderId !== null) {
        setFlash(true);
        const t = setTimeout(() => setFlash(false), 2400);
        return () => clearTimeout(t);
      }
      setLeaderId(top);
    }
  }, [rows, leaderId]);

  return (
    <div className={`card-premium rounded-2xl p-6 md:p-7 ${flash ? "animate-pulse-gold" : ""}`}>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-xl md:text-2xl font-display tracking-wider">{title}</h2>
      </div>
      <div className="grid grid-cols-[40px_1fr_auto] gap-3 text-xs uppercase tracking-widest text-muted-foreground px-3 pb-2 border-b border-border">
        <span>Pos</span><span>{label}</span><span>Pontos</span>
      </div>
      <ul className="mt-2 divide-y divide-border/50">
        {rows.length === 0 && (
          <li className="text-sm text-muted-foreground py-6 text-center">Aguardando primeiros pontos…</li>
        )}
        {rows.map((r, i) => {
          const pos = i + 1;
          return (
            <li key={r.id} className={`grid grid-cols-[40px_1fr_auto] gap-3 items-center px-3 py-3 rounded-md transition-all ${rowClass(pos)}`}>
              <span className="flex items-center justify-center"><RankBadge pos={pos} /></span>
              <span className="font-medium truncate">{r.name}</span>
              <span className={`font-display text-lg ${pos === 1 ? "gradient-text-gold" : ""}`}>{r.points}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function LeaderBar({ franchise, seller, prize }: { franchise?: Row; seller?: Row; prize: string }) {
  return (
    <div className="card-premium rounded-2xl p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🥇</span>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Franquia líder</div>
          <div className="font-display text-lg truncate">{franchise?.name ?? "—"}</div>
        </div>
        {franchise && <span className="ml-auto font-display gradient-text-gold text-xl">{franchise.points}</span>}
      </div>
      <div className="flex items-center gap-3 md:border-l md:border-border md:pl-6">
        <span className="text-2xl">⚽</span>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Vendedor líder</div>
          <div className="font-display text-lg truncate">{seller?.name ?? "—"}</div>
        </div>
        {seller && <span className="ml-auto font-display gradient-text-gold text-xl">{seller.points}</span>}
      </div>
      <div className="flex items-center gap-3 md:border-l md:border-border md:pl-6">
        <Trophy className="h-6 w-6" style={{ color: "var(--gold)" }} />
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Prêmio da campanha</div>
          <div className="font-display text-lg truncate">{prize}</div>
        </div>
      </div>
    </div>
  );
}

function Index() {
  const franchises = useRanking("franchises");
  const sellers = useRanking("sellers");
  const prize = useCampaign();

  const [quoteIdx, setQuoteIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const topF = useMemo(() => franchises[0], [franchises]);
  const topS = useMemo(() => sellers[0], [sellers]);

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header className="max-w-7xl mx-auto px-5 md:px-8 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" style={{ color: "var(--gold)" }} />
          <span className="font-display tracking-widest text-sm">COPA MRT 2026</span>
        </div>
        <Link to="/admin" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition">
          Admin
        </Link>
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-12 text-center">
        <div className="absolute inset-x-0 top-0 h-[420px] -z-10 opacity-70" style={{
          background: "radial-gradient(ellipse at 50% 0%, oklch(0.82 0.14 85 / 22%) 0%, transparent 60%)",
        }} />
        <div className="flex justify-center">
          <div className="relative animate-float">
            <img
              src={trophyImg}
              alt="Troféu Copa MRT 2026"
              width={260}
              height={260}
              className="h-48 md:h-64 w-auto drop-shadow-[0_30px_60px_rgba(212,175,55,0.35)]"
            />
            <div className="absolute inset-0 -z-10 blur-3xl rounded-full" style={{ background: "oklch(0.82 0.14 85 / 30%)" }} />
          </div>
        </div>

        <h1 className="mt-6 text-5xl md:text-7xl lg:text-8xl font-display gradient-text-gold leading-none">
          COPA MRT 2026
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          Cada venda vale pontos. Cada ponto aproxima da taça.
        </p>

        <div className="mt-6 h-7 overflow-hidden">
          <p key={quoteIdx} className="text-sm md:text-base text-gold tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-700">
            “{QUOTES[quoteIdx]}”
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <a href="#ranking" className="btn-gold rounded-full px-7 py-3 text-sm">
            Ver Classificação
          </a>
        </div>
      </section>

      {/* Leader bar */}
      <section className="max-w-7xl mx-auto px-5 md:px-8">
        <LeaderBar franchise={topF} seller={topS} prize={prize} />
      </section>

      {/* Rankings */}
      <section id="ranking" className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14 grid gap-6 md:grid-cols-2">
        <RankTable title="Ranking das Franquias" icon="🏆" rows={franchises} label="Franquia" />
        <RankTable title="Ranking dos Vendedores" icon="⚽" rows={sellers} label="Vendedor" />
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-5 md:px-8 py-10 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground border-t border-border">
        Copa MRT 2026 • O jogo das vendas começou.
      </footer>
    </div>
  );
}
