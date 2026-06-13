import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { useState, useRef, useEffect } from "react";
import { Send, PawPrint, Headset } from "lucide-react";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chat — Nobre Patinhas" }] }),
  component: Chat,
});

const API = "http://localhost/nobre-patinhas-api";

function autoReply(t: string): { text: string; handover: boolean } {
  if (/atendente|humano|pessoa/i.test(t))
    return { text: "Encaminhando para um atendente humano. Em instantes ele responderá aqui!", handover: true };
  if (/agend/i.test(t))
    return { text: "Você pode agendar pelo menu 'Agendamento'. Quer que eu te leve até lá?", handover: false };
  if (/preç|valor/i.test(t))
    return { text: "Nossos serviços começam em R$ 60. Confira a aba Agendamento!", handover: false };
  if (/entreg/i.test(t))
    return { text: "Entregamos em até 48h e o frete é grátis acima de R$ 200.", handover: false };
  return { text: "Obrigado pela mensagem! Se preferir falar com um atendente humano, digite 'atendente'.", handover: false };
}

function Chat() {
  const [auth] = useAuth();
  const [threadId, setThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [handover, setHandover] = useState(false);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cria ou recupera thread ao montar
  useEffect(() => {
    const usuarioId = auth?.id ?? 0;
    fetch(`${API}/gerenciar_thread.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "criar", usuario_id: Number(usuarioId) }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setThreadId(d.thread_id);
      })
      .catch(console.error);
  }, [auth?.id]);

  // Polling de mensagens a cada 3s
  useEffect(() => {
    if (!threadId) return;
    const load = () => {
      fetch(`${API}/listar_mensagens.php?thread_id=${threadId}`)
        .then((r) => r.json())
        .then((data) => {
          setMessages(data);
          // Verifica se virou handover
          const hasStaff = data.some((m: any) => m.remetente === "staff");
          if (hasStaff) setHandover(true);
        })
        .catch(console.error);
    };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999 });
  }, [messages.length]);

  const sendMsg = async (remetente: "user" | "bot", texto: string) => {
    if (!threadId) return;
    await fetch(`${API}/enviar_mensagem.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id: threadId, remetente, texto }),
    });
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !threadId) return;
    setText("");

    await sendMsg("user", t);

    if (!handover) {
      const reply = autoReply(t);
      await sendMsg("bot", reply.text);

      if (reply.handover) {
        setHandover(true);
        await fetch(`${API}/gerenciar_thread.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ acao: "atualizar", thread_id: threadId, handover: 1 }),
        });
      }
    }
  };

  const displayMessages =
    messages.length === 0
      ? [{ remetente: "bot", texto: "Olá! 🐾 Sou o assistente do Nobre Patinhas. Como posso ajudar?", enviado_em: "" }]
      : messages;

  return (
    <Layout>
      <PageHeader title="Chat Online" subtitle="Tire suas dúvidas em tempo real." />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <div className="flex h-[60vh] flex-col rounded-2xl border bg-card shadow-sm">
          {handover && (
            <div className="flex items-center gap-2 rounded-t-2xl border-b bg-action/20 px-4 py-2 text-xs font-bold text-action-foreground">
              <Headset className="size-4" /> Atendimento humano em andamento
            </div>
          )}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-6">
            {displayMessages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.remetente === "user" ? "justify-end" : ""}`}>
                {m.remetente !== "user" && (
                  <div className={`grid size-8 shrink-0 place-items-center rounded-full ${m.remetente === "staff" ? "bg-action text-action-foreground" : "bg-primary text-primary-foreground"}`}>
                    {m.remetente === "staff" ? <Headset className="size-4" /> : <PawPrint className="size-4" />}
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${m.remetente === "user" ? "bg-primary text-primary-foreground" : m.remetente === "staff" ? "bg-action/30 text-foreground" : "bg-accent text-foreground"}`}>
                  {m.remetente === "staff" && (
                    <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-action-foreground/80">Atendente</div>
                  )}
                  {m.texto}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t p-4">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="h-11 flex-1 rounded-full border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button type="submit" className="grid size-11 place-items-center rounded-full bg-action text-action-foreground hover:brightness-105">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}