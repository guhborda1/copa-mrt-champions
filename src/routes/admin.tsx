import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  verifyAdminPassword,
  upsertFranchise,
  deleteFranchise,
  upsertSeller,
  deleteSeller,
  updatePrize,
  updateEndDate,
} from "@/lib/admin.functions";
import { Trash2, Pencil, Plus, Shield, LogOut, Save, CalendarClock } from "lucide-react";
import { toast, Toaster } from "sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Copa MRT 2026" }] }),
  component: Admin,
});

type Row = { id: string; name: string; points: number };

function useRows(table: "franchises" | "sellers") {
  const [rows, setRows] = useState<Row[]>([]);
  const reload = async () => {
    const { data } = await supabase.from(table).select("id,name,points").order("points", { ascending: false });
    if (data) setRows(data as Row[]);
  };
  useEffect(() => {
    reload();
    const ch = supabase.channel(`adm-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => reload())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
  return rows;
}

function Editor({
  label,
  rows,
  onSave,
  onDelete,
}: {
  label: string;
  rows: Row[];
  onSave: (r: { id?: string; name: string; points: number }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);

  const reset = () => { setName(""); setPoints(0); setEditId(null); };

  return (
    <div className="card-premium rounded-2xl p-6">
      <h2 className="font-display text-xl tracking-widest mb-4">{label}</h2>

      <form
        className="flex flex-col md:flex-row gap-2 mb-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          try {
            await onSave({ id: editId ?? undefined, name: name.trim(), points: Number(points) || 0 });
            toast.success(editId ? "Atualizado" : "Adicionado");
            reset();
          } catch (err: any) { toast.error(err.message ?? "Erro"); }
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="flex-1 bg-input/60 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          placeholder="Pontos"
          className="w-full md:w-32 bg-input/60 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button type="submit" className="btn-gold rounded-md px-4 py-2 text-sm inline-flex items-center gap-2">
          {editId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {editId ? "Salvar" : "Adicionar"}
        </button>
        {editId && (
          <button type="button" onClick={reset} className="rounded-md border border-border px-4 py-2 text-sm">
            Cancelar
          </button>
        )}
      </form>

      <ul className="divide-y divide-border/50">
        {rows.map((r, i) => (
          <li key={r.id} className="flex items-center gap-3 py-2.5">
            <span className="w-6 text-center text-muted-foreground text-sm">{i + 1}</span>
            <span className="flex-1 truncate">{r.name}</span>
            <span className="font-display text-lg gradient-text-gold w-16 text-right">{r.points}</span>
            <button
              onClick={() => { setEditId(r.id); setName(r.name); setPoints(r.points); }}
              className="p-2 rounded hover:bg-secondary transition"
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={async () => {
                if (!confirm(`Excluir "${r.name}"?`)) return;
                try { await onDelete(r.id); toast.success("Excluído"); }
                catch (e: any) { toast.error(e.message ?? "Erro"); }
              }}
              className="p-2 rounded hover:bg-destructive/20 transition text-destructive"
              aria-label="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function CampaignEditor({ password }: { password: string }) {
  const [prize, setPrize] = useState("");
  const [endDate, setEndDate] = useState("");
  const updatePrizeFn = useServerFn(updatePrize);
  const updateEndDateFn = useServerFn(updateEndDate);

  useEffect(() => {
    supabase.from("campaign_info").select("prize,end_date").eq("id", 1).maybeSingle()
      .then(({ data }) => {
        if (data?.prize) setPrize(data.prize);
        setEndDate(toLocalInput(data?.end_date ?? null));
      });
  }, []);

  return (
    <form
      className="card-premium rounded-2xl p-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          const iso = endDate ? new Date(endDate).toISOString() : null;
          await Promise.all([
            updatePrizeFn({ data: { password, prize } }),
            updateEndDateFn({ data: { password, end_date: iso } }),
          ]);
          toast.success("Campanha atualizada");
        } catch (err: any) { toast.error(err.message ?? "Erro"); }
      }}
    >
      <h2 className="font-display text-xl tracking-widest">Campanha</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Prêmio</label>
          <input
            value={prize}
            onChange={(e) => setPrize(e.target.value)}
            className="mt-1 w-full bg-input/60 border border-border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" /> Encerramento da Copa
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 w-full bg-input/60 border border-border rounded-md px-3 py-2 text-sm"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Define o contador regressivo da home. Deixe em branco para ocultar.
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="btn-gold rounded-md px-5 py-2 text-sm">Salvar campanha</button>
      </div>
    </form>
  );
}

function Admin() {
  const [password, setPassword] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const verify = useServerFn(verifyAdminPassword);
  const upF = useServerFn(upsertFranchise);
  const delF = useServerFn(deleteFranchise);
  const upS = useServerFn(upsertSeller);
  const delS = useServerFn(deleteSeller);

  useEffect(() => {
    const cached = sessionStorage.getItem("mrt_admin_pw");
    if (cached) {
      verify({ data: { password: cached } })
        .then(() => setPassword(cached))
        .catch(() => sessionStorage.removeItem("mrt_admin_pw"));
    }
  }, [verify]);

  const franchises = useRows("franchises");
  const sellers = useRows("sellers");

  if (!password) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Toaster theme="dark" position="top-center" />
        <form
          className="card-premium rounded-2xl p-8 w-full max-w-sm"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            try {
              await verify({ data: { password: input } });
              sessionStorage.setItem("mrt_admin_pw", input);
              setPassword(input);
            } catch (err: any) {
              toast.error(err.message ?? "Senha incorreta");
            } finally { setLoading(false); }
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6" style={{ color: "var(--gold)" }} />
            <h1 className="font-display text-2xl tracking-widest">Vestiário</h1>
          </div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Senha de admin</label>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-2 w-full bg-input/60 border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          <button disabled={loading} className="btn-gold w-full mt-5 rounded-md py-2.5 text-sm">
            {loading ? "Entrando…" : "Entrar"}
          </button>
          <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-foreground mt-4 uppercase tracking-widest">
            ← Voltar
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-center" />
      <header className="max-w-7xl mx-auto px-5 md:px-8 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" style={{ color: "var(--gold)" }} />
          <span className="font-display tracking-widest text-sm">ADMIN • COPA MRT 2026</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">Site público</Link>
          <button
            onClick={() => { sessionStorage.removeItem("mrt_admin_pw"); setPassword(null); }}
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8 space-y-6">
        <CampaignEditor password={password} />
        <div className="grid gap-6 md:grid-cols-2">
          <Editor
            label="🏆 Seleções MRT"
            rows={franchises}
            onSave={(r) => upF({ data: { password, ...r } }).then(() => undefined)}
            onDelete={(id) => delF({ data: { password, id } }).then(() => undefined)}
          />
          <Editor
            label="⚽ Artilheiros da Copa MRT"
            rows={sellers}
            onSave={(r) => upS({ data: { password, ...r } }).then(() => undefined)}
            onDelete={(id) => delS({ data: { password, id } }).then(() => undefined)}
          />
        </div>
      </main>
    </div>
  );
}
