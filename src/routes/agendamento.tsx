import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { useAuth, notify } from "@/lib/store";
import { SERVICES } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Calendar, Bath, Scissors, Stethoscope, Syringe, Bubbles, Clock, PawPrint } from "lucide-react";

export const Route = createFileRoute("/agendamento")({
  head: () => ({ meta: [{ title: "Agendamento — Nobre Patinhas" }] }),
  component: Agendamento,
});

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  banho: Bath, tosa: Scissors, consulta: Stethoscope, vacinacao: Syringe, hidratacao: Bubbles,
};

const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

type Pet = {
  id: number;
  nome: string;
  especie: string;
  raca: string;
};

function Agendamento() {
  const [auth] = useAuth();
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const navigate = useNavigate();

  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [petId, setPetId] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (myPets.length > 0) {
      setPetId((prev) => prev || String(myPets[0].id));
    }
  }, [myPets]);

  useEffect(() => {

    if (!auth) return;

    loadPets();

  }, [auth]);

  const loadPets = async () => {

    try {

      const response = await fetch(
        `http://localhost/nobre-patinhas-api/listar_pets_usuario.php?usuario_id=${auth?.id}`
      );

      const data = await response.json();

      setMyPets(data);

    } catch (error) {

      console.error(error);

    }
  };

  const submit = async (e: React.FormEvent) => {

    e.preventDefault();

    if (!auth) {
      toast.error("Faça login para agendar");
      navigate({ to: "/login" });
      return;
    }

    if (!petId) {
      toast.error("Cadastre um pet primeiro");
      navigate({ to: "/conta" });
      return;
    }

    try {

      const response = await fetch(
        "http://localhost/nobre-patinhas-api/cadastrar_agendamento.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            usuario_id: Number(auth.id),
            pet_id: Number(petId),
            servico_id: serviceId,
            data_agendamento: date,
            horario: time,
            observacoes: notes
          })
        }
      );

      if (!date || !time) {
        toast.error("Selecione data e horário");
        return;
      }
      
      const data = await response.json();

      if (!data.success) {
        toast.error("Erro ao criar agendamento");
        return;
      }

      const svc = SERVICES.find(
        (s) => s.id === serviceId
      );

      toast.success("Agendamento confirmado!");

      notify(
        "Agendamento confirmado 🐾",
        `${svc?.name} em ${date} às ${time}`
      );

      navigate({ to: "/conta" });

    } catch (error) {

      console.error(error);

      toast.error("Erro ao conectar ao servidor");
      
      console.log("petId atual:", petId);
    }
  };

  return (
    <Layout>
      <PageHeader title="Agendar Serviço" subtitle="Banho, tosa, consultas, vacinação e muito mais." />
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        <form onSubmit={submit} className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm md:p-8">
          <section>
            <h3 className="mb-3 font-bold text-primary">1. Escolha o serviço</h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {SERVICES.map((s) => {
                const Icon = SERVICE_ICONS[s.id] ?? Bath;
                return (
                  <label key={s.id} className={`cursor-pointer rounded-xl border-2 p-4 text-center transition ${serviceId === s.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                    <input type="radio" name="svc" className="sr-only" checked={serviceId === s.id} onChange={() => setServiceId(s.id)} />
                    <span className={`mx-auto grid size-14 place-items-center rounded-full ${serviceId === s.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                      <Icon className="size-7" />
                    </span>
                    <div className="mt-2 text-sm font-bold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">R$ {s.price}</div>
                  </label>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-bold text-primary">2. Pet</h3>
            {myPets.length === 0 ? (
              <div className="flex items-center justify-between rounded-lg border border-dashed bg-accent/20 p-4 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground"><PawPrint className="size-4" /> Você ainda não cadastrou um pet.</span>
                <Link to="/conta" className="font-bold text-primary hover:underline">Cadastrar pet →</Link>
              </div>
            ) : (
              <select
                value={petId}
                onChange={(e) => {
                  console.log("Selecionado:", e.target.value);
                  setPetId(e.target.value);
                }}
                className="h-11 w-full rounded-md border bg-background px-3"
              >
                {myPets.map((p) => (
                  <option
                    key={p.id}
                    value={String(p.id)}
                  >
                    {p.nome} — {p.raca}
                  </option>
                ))}
              </select>
            )}
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-bold text-primary">3. Data</h3>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} className="h-11 w-full rounded-md border bg-background pl-10 pr-3" />
              </div>
            </div>
            <div>
              <h3 className="mb-3 font-bold text-primary">4. Horário</h3>
              <div className="grid grid-cols-4 gap-2">
                {TIMES.map((t) => (
                  <button type="button" key={t} onClick={() => setTime(t)} className={`flex items-center justify-center gap-1 rounded-md border py-2 text-sm font-semibold transition ${time === t ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40"}`}>
                    <Clock className="size-3" /> {t}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-bold text-primary">5. Observações</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Algo importante sobre o seu pet?" className="w-full rounded-md border bg-background p-3 text-sm" />
          </section>

          <Button type="submit" variant="action" size="lg" className="w-full rounded-full" disabled={!time || !date}>
            Confirmar Agendamento
          </Button>
        </form>
      </div>
    </Layout>
  );
}
