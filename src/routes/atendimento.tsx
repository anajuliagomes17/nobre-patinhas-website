import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { useAuth } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import { Send, Headset, PawPrint, CircleDot, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/atendimento")({
  head: () => ({ meta: [{ title: "Atendimento — Nobre Patinhas" }] }),
  component: Atendimento,
});

const API = "http://localhost/nobre-patinhas-api";

function Atendimento() {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth) navigate({ to: "/login" });
    else if (auth.role !== "funcionario" && auth.role !== "admin") navigate({ to: "/" });
  }, [auth, navigate]);

  // Polling de threads a cada 4s
  useEffect(() => {
    const load = () => {
      fetch(`${API}/gerenciar_thread.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao: "listar" }),
      })
        .then((r) => r.json())
        .then(setThreads)
        .catch(console.error);
    };
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, []);

  // Polling de mensagens da thread selecionada a cada 3s
  useEffect(() => {
    if (!selectedId) return;
    const load = () => {
      fetch(`${API}/listar_mensagens.php?thread_id=${selectedId}`)
        .then((r) => r.json())
        .then(setMessages)
        .catch(console.error);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [selectedId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999 });
  }, [messages.length]);

  if (!auth || (auth.role !== "funcionario" && auth.role !== "admin")) return null;

  const pending = threads.filter((t) => t.handover == 1 && t.closed == 0);
  const closed = threads.filter((t) => t.closed == 1);
  const selected = threads.find((t) => t.id === selectedId);

  const reply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !text.trim()) return;
    await fetch(`${API}/enviar_mensagem.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id: selectedId, remetente: "staff", texto: text.trim() }),
    });
    setText("");
  };

  const close = async () => {
    if (!selectedId) return;
    await fetch(`${API}/gerenciar_thread.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "atualizar", thread_id: selectedId, closed: 1 }),
    });
    setSelectedId(null);
  };

  return (
    <Layout>
      <PageHeader title="Painel de Atendimento" subtitle="Responda clientes encaminhados para atendimento humano." />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-4 md:grid-cols-[300px_1fr]">
          <aside className="rounded-xl border bg-card shadow-sm">
            <div className="border-b p-3 text-sm font-bold text-primary">
              Conversas ativas ({pending.length})
            </div>
            <ul className="max-h-[60vh] overflow-y-auto">
              {pending.length === 0 ? (
                <li className="p-6 text-center text-xs text-muted-foreground">Nenhuma conversa aguardando.</li>
              ) : pending.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedId(t.id)}
                    className={`flex w-full items-start gap-2 border-b p-3 text-left text-sm transition hover:bg-accent/40 ${selectedId === t.id ? "bg-accent/60" : ""}`}
                  >
                    <CircleDot className="size-4 shrink-0 text-action" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{t.usuario_nome}</div>
                      <div className="truncate text-xs text-muted-foreground">Thread #{t.id}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
            {closed.length > 0 && (
              <details className="border-t">
                <summary className="cursor-pointer p-3 text-xs font-semibold text-muted-foreground">
                  Encerradas ({closed.length})
                </summary>
                <ul>
                  {closed.map((t) => (
                    <li key={t.id}>
                      <button
                        onClick={() => setSelectedId(t.id)}
                        className="flex w-full items-center gap-2 border-t p-3 text-left text-xs hover:bg-accent/30"
                      >
                        <CheckCircle2 className="size-3 text-primary" /> {t.usuario_nome}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </aside>

          <section className="flex h-[60vh] flex-col rounded-xl border bg-card shadow-sm">
            {!selected ? (
              <div className="grid flex-1 place-items-center text-center text-sm text-muted-foreground">
                <div>
                  <Headset className="mx-auto size-10 text-primary/60" />
                  <p className="mt-2">Selecione uma conversa para atender.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b p-3">
                  <div>
                    <p className="text-sm font-bold">{selected.usuario_nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {selected.closed == 1 ? "Encerrada" : "Em atendimento"}
                    </p>
                  </div>
                  {selected.closed == 0 && (
                    <Button variant="outline" size="sm" onClick={close}>Encerrar</Button>
                  )}
                </div>
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.remetente === "staff" ? "justify-end" : ""}`}>
                      {m.remetente !== "staff" && (
                        <div className={`grid size-7 shrink-0 place-items-center rounded-full ${m.remetente === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-primary"}`}>
                          {m.remetente === "user"
                            ? <span className="text-xs font-bold">{selected.usuario_nome[0]?.toUpperCase()}</span>
                            : <PawPrint className="size-3.5" />}
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${m.remetente === "staff" ? "bg-action text-action-foreground" : m.remetente === "user" ? "bg-primary/10 text-foreground" : "bg-accent text-foreground"}`}>
                        {m.texto}
                      </div>
                    </div>
                  ))}
                </div>
                {selected.closed == 0 && (
                  <form onSubmit={reply} className="flex gap-2 border-t p-3">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Responder ao cliente..."
                      className="h-10 flex-1 rounded-full border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button type="submit" className="grid size-10 place-items-center rounded-full bg-action text-action-foreground hover:brightness-105">
                      <Send className="size-4" />
                    </button>
                  </form>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}