import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import trophyImg from "@/assets/trophy.png";
import { Trophy, Crown, Sparkles, Medal, Flame, TrendingUp, TrendingDown, Minus, Timer, Gift } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Copa MRT 2026 — Painel da Competição" },
      { name: "description", content: "Ranking em tempo real das Seleções MRT e Artilheiros da Copa MRT. Cada venda é um gol." },
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
  "Toda venda aproxima sua seleção do título.",
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
  const [info, setInfo] = useState<{ prize: string; end_date: string | null }>({
    prize: "Troféu Copa MRT 2026",
    end_date: null,
  });
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("campaign_info").select("prize,end_date").eq("id", 1).maybeSingle();
      if (data) setInfo({ prize: data.prize ?? "Troféu Copa MRT 2026", end_date: data.end_date });
    };
    load();
    const ch = supabase.channel("rt-campaign")
      .on("postgres_changes", { event: "*", schema: "public", table: "campaign_info" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);
  return info;
}

/* ---------------- Countdown ---------------- */
function useCountdown(endIso: string | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!endIso) return null;
  const diff = Math.max(0, new Date(endIso).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, ended: diff === 0 };
}

function CountdownCard({ endIso }: { endIso: string | null }) {
  const cd = useCountdown(endIso);
  const cell = (n: number, l: string) => (
    <div className="glass-cell flex flex-col items-center justify-center px-3 py-2.5 md:px-5 md:py-3 min-w-[64px] md:min-w-[78px]">
      <span className="font-display text-2xl md:text-4xl gradient-text-gold leading-none tabular-nums">
        {String(n).padStart(2, "0")}
      </span>
      <span className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">{l}</span>
    </div>
  );
  return (
    <div className="glass-card rounded-2xl p-5 md:p-6">
      <div className="flex items-center gap-2 mb-3">
        <Timer className="h-4 w-4" style={{ color: "var(--gold)" }} />
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Encerramento da Copa</span>
      </div>
      {!cd ? (
        <div className="text-sm text-muted-foreground">Data não definida.</div>
      ) : cd.ended ? (
        <div className="font-display text-2xl gradient-text-gold">Campanha encerrada</div>
      ) : (
        <div className="flex gap-2 md:gap-3">
          {cell(cd.d, "Dias")}
          {cell(cd.h, "Hrs")}
          {cell(cd.m, "Min")}
          {cell(cd.s, "Seg")}
        </div>
      )}
    </div>
  );
}

/* ---------------- Prize card ---------------- */
function PrizeCard({ prize }: { prize: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-gold)" }} />
      <div className="flex items-center gap-2 mb-3">
        <Gift className="h-4 w-4" style={{ color: "var(--gold)" }} />
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Prêmio da campanha</span>
      </div>
      <div className="flex items-center gap-3">
        <Trophy className="h-10 w-10 shrink-0" style={{ color: "var(--gold)" }} />
        <div className="font-display text-xl md:text-2xl leading-tight gradient-text-gold">{prize}</div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Disputado pela seleção e artilheiro com mais pontos ao final da campanha.
      </p>
    </div>
  );
}

/* ---------------- Medal / position movement ---------------- */
function MedalIcon({ pos }: { pos: number }) {
  if (pos === 1) return (
    <div className="medal medal-gold"><Crown className="h-4 w-4" /></div>
  );
  if (pos === 2) return (
    <div className="medal medal-silver"><Medal className="h-4 w-4" /></div>
  );
  if (pos === 3) return (
    <div className="medal medal-bronze"><Medal className="h-4 w-4" /></div>
  );
  return <span className="text-muted-foreground text-sm w-7 text-center inline-block">{pos}</span>;
}

function MoveIcon({ delta }: { delta: number }) {
  if (delta > 0) return <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400"><TrendingUp className="h-3 w-3" />{delta}</span>;
  if (delta < 0) return <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-400"><TrendingDown className="h-3 w-3" />{Math.abs(delta)}</span>;
  return <span className="inline-flex items-center text-[10px] text-muted-foreground"><Minus className="h-3 w-3" /></span>;
}

/* ---------------- Ranking table ---------------- */
function RankTable({ title, icon, rows, label }: { title: string; icon: React.ReactNode; rows: Row[]; label: string }) {
  const prevRef = useRef<Map<string, number>>(new Map());
  const [deltas, setDeltas] = useState<Map<string, number>>(new Map());
  const [flashLeader, setFlashLeader] = useState(false);

  useEffect(() => {
    const next = new Map<string, number>();
    rows.forEach((r, i) => next.set(r.id, i + 1));
    const d = new Map<string, number>();
    next.forEach((pos, id) => {
      const prev = prevRef.current.get(id);
      d.set(id, prev ? prev - pos : 0);
    });
    setDeltas(d);

    const topId = rows[0]?.id;
    const prevTopId = [...prevRef.current.entries()].find(([, p]) => p === 1)?.[0];
    if (topId && prevTopId && topId !== prevTopId) {
      setFlashLeader(true);
      const t = setTimeout(() => setFlashLeader(false), 2400);
      prevRef.current = next;
      return () => clearTimeout(t);
    }
    prevRef.current = next;
  }, [rows]);

  const top = rows[0]?.points ?? 0;

  return (
    <div className={`glass-card rounded-2xl p-5 md:p-7 ${flashLeader ? "animate-pulse-gold" : ""}`}>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">{icon}</span>
        <h2 className="text-lg md:text-2xl font-display tracking-wider">{title}</h2>
      </div>
      <div className="grid grid-cols-[44px_1fr_auto] gap-3 text-[10px] uppercase tracking-[0.25em] text-muted-foreground px-3 pb-2 border-b border-white/10">
        <span>Pos</span><span>{label}</span><span>Pontos</span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {rows.length === 0 && (
          <li className="text-sm text-muted-foreground py-6 text-center">Aguardando primeiros pontos…</li>
        )}
        {rows.map((r, i) => {
          const pos = i + 1;
          const delta = deltas.get(r.id) ?? 0;
          const pct = top > 0 ? Math.max(4, Math.round((r.points / top) * 100)) : 0;
          const gap = top - r.points;
          return (
            <li
              key={r.id}
              className={`rank-row grid grid-cols-[44px_1fr_auto] items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500 ${pos === 1 ? "rank-leader" : ""}`}
              style={{ transform: `translateY(0)` }}
            >
              <span className="flex items-center justify-center"><MedalIcon pos={pos} /></span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`truncate font-semibold ${pos === 1 ? "text-foreground" : ""}`}>{r.name}</span>
                  {pos !== 1 && <span className="text-[10px] text-muted-foreground">−{gap} pts do líder</span>}
                  {pos === 1 && <span className="text-[10px] uppercase tracking-widest text-gold inline-flex items-center gap-1"><Flame className="h-3 w-3" />Líder</span>}
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/8 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: pos === 1 ? "var(--gradient-gold)" : "linear-gradient(90deg, oklch(0.55 0.18 145), oklch(0.78 0.16 110))",
                      boxShadow: pos === 1 ? "0 0 16px oklch(0.88 0.18 95 / 50%)" : undefined,
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className={`font-display text-lg md:text-xl tabular-nums ${pos === 1 ? "gradient-text-gold" : "text-foreground"}`}>{r.points}</span>
                <MoveIcon delta={delta} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------------- Leader spotlight ---------------- */
function LeaderSpotlight({ franchise, seller }: { franchise?: Row; seller?: Row }) {
  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 grid gap-4 md:grid-cols-2 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-60"
        style={{ background: "radial-gradient(ellipse at 30% 0%, oklch(0.88 0.18 95 / 18%), transparent 60%)" }} />
      <LeaderSlot
        label="Seleção líder"
        icon={<Crown className="h-5 w-5" style={{ color: "var(--gold)" }} />}
        row={franchise}
        accent="🥇"
      />
      <LeaderSlot
        label="Artilheiro líder"
        icon={<Flame className="h-5 w-5" style={{ color: "var(--gold)" }} />}
        row={seller}
        accent="⚽"
      />
    </div>
  );
}

function LeaderSlot({ label, icon, row, accent }: { label: string; icon: React.ReactNode; row?: Row; accent: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-4xl">{accent}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
        </div>
        <div className="font-display text-2xl md:text-3xl truncate mt-1">{row?.name ?? "—"}</div>
        {row && (
          <div className="text-sm text-muted-foreground mt-0.5">
            <span className="gradient-text-gold font-display text-xl mr-1">{row.points}</span>
            pontos na campanha
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
function Index() {
  const franchises = useRanking("franchises");
  const sellers = useRanking("sellers");
  const { prize, end_date } = useCampaign();

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
        <div className="flex items-center gap-3">
          <img
            src="/__l5e/assets-v1/7743b808-b5d9-4bcf-b495-88515942c774/logo-mrt.png"
            alt="Logo MRT"
            width={40}
            height={40}
            className="h-9 w-9 md:h-10 md:w-10 rounded-full object-contain bg-white/90 shadow-sm"
          />
          <Sparkles className="h-5 w-5" style={{ color: "var(--gold)" }} />
          <span className="font-display tracking-widest text-sm">COPA MRT 2026</span>
        </div>
        <Link to="/admin" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition">
          Admin
        </Link>
      </header>

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-5 md:px-8 pt-8 md:pt-14 pb-10 text-center">
        <div className="absolute inset-x-0 top-0 h-[520px] -z-10 opacity-80 pointer-events-none" style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 0%, oklch(0.88 0.18 95 / 28%) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 15% 30%, oklch(0.70 0.22 130 / 22%) 0%, transparent 60%), radial-gradient(ellipse 40% 50% at 85% 30%, oklch(0.88 0.18 95 / 18%) 0%, transparent 60%)",
        }} />

        <div className="flex justify-center">
          <div className="relative animate-float-slow">
            <div className="absolute -inset-10 -z-10 rounded-full blur-3xl opacity-70"
              style={{ background: "radial-gradient(circle, oklch(0.88 0.18 95 / 45%), transparent 60%)" }} />
            <img
              src={trophyImg}
              alt="Troféu Copa MRT 2026"
              width={360}
              height={360}
              className="h-60 sm:h-72 md:h-[22rem] lg:h-[26rem] w-auto drop-shadow-[0_40px_80px_rgba(212,175,55,0.45)] trophy-glow"
            />
          </div>
        </div>

        <h1 className="mt-8 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display gradient-text-gold leading-none break-words">
          COPA MRT 2026
        </h1>
        <p className="mt-5 text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2 tracking-wide">
          O jogo das vendas começou. Cada venda vale pontos. Cada ponto aproxima da taça.
        </p>

        <div className="mt-5 h-7 overflow-hidden">
          <p key={quoteIdx} className="text-sm md:text-base text-gold tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-700">
            “{QUOTES[quoteIdx]}”
          </p>
        </div>

        <div className="mt-7 flex justify-center">
          <a href="#ranking" className="btn-gold rounded-full px-8 py-3 text-sm">
            Ver Classificação
          </a>
        </div>
      </section>

      {/* Premium info row */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 grid gap-5 md:grid-cols-3">
        <PrizeCard prize={prize} />
        <CountdownCard endIso={end_date} />
        <LeaderHighlight franchise={topF} seller={topS} />
      </section>

      {/* Leader spotlight */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 mt-5">
        <LeaderSpotlight franchise={topF} seller={topS} />
      </section>

      {/* Rankings */}
      <section id="ranking" className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14 grid gap-6 md:grid-cols-2">
        <RankTable title="Seleções MRT" icon="🏆" rows={franchises} label="Seleção" />
        <RankTable title="Artilheiros da Copa MRT" icon="⚽" rows={sellers} label="Artilheiro" />
      </section>

      <footer className="max-w-7xl mx-auto px-5 md:px-8 py-10 text-center text-[10px] uppercase tracking-[0.4em] text-muted-foreground border-t border-white/10">
        Copa MRT 2026 • A final de uma campanha milionária.
      </footer>
    </div>
  );
}

function LeaderHighlight({ franchise, seller }: { franchise?: Row; seller?: Row }) {
  const gap = franchise && seller ? Math.abs((franchise.points ?? 0) - (seller.points ?? 0)) : 0;
  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-60"
        style={{ background: "radial-gradient(circle at 80% 20%, oklch(0.88 0.18 95 / 18%), transparent 60%)" }} />
      <div className="flex items-center gap-2 mb-3">
        <Crown className="h-4 w-4" style={{ color: "var(--gold)" }} />
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Destaque da rodada</span>
      </div>
      <div className="font-display text-xl md:text-2xl gradient-text-gold truncate">
        {franchise?.name ?? "—"}
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        lidera a Copa com <span className="text-foreground font-semibold">{franchise?.points ?? 0}</span> pontos
      </div>
      <div className="mt-3 pt-3 border-t border-white/10 text-xs text-muted-foreground">
        Artilheiro: <span className="text-foreground font-semibold">{seller?.name ?? "—"}</span>
        {seller && <> · <span className="gradient-text-gold font-display">{seller.points}</span> pts</>}
      </div>
    </div>
  );
}
