import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { useAuth, useUsers, usePets, useOrders, useAppointments, uid, fileToDataUrl } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/lib/seed";
import { useProducts } from "@/lib/store";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PawPrint, Package, Calendar, User as UserIcon, Plus, Trash2, Camera, X, Pencil, Bath, Scissors, Stethoscope, Syringe, Bubbles } from "lucide-react";
import { formatBRL } from "@/components/ProductCard";

export const Route = createFileRoute("/conta")({
  head: () => ({ meta: [{ title: "Minha Conta — Nobre Patinhas" }] }),
  component: Conta,
});

type Tab = "dados" | "pets" | "pedidos" | "agendamentos";

function Conta() {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("pets");

  useEffect(() => { if (!auth) navigate({ to: "/login" }); }, [auth, navigate]);
  if (!auth) return null;

  return (
    <Layout>
      <PageHeader title={`Olá, ${auth.name.split(" ")[0]}!`} subtitle="Gerencie sua conta, pets e pedidos." />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className="rounded-xl border bg-card p-3 shadow-sm md:sticky md:top-24 md:h-fit">
            {([
              { id: "pets", label: "Meus Pets", Icon: PawPrint },
              { id: "agendamentos", label: "Agendamentos", Icon: Calendar },
              { id: "pedidos", label: "Pedidos", Icon: Package },
              { id: "dados", label: "Meus Dados", Icon: UserIcon },
            ] as const).map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setTab(id)} className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${tab === id ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </aside>
          <section>
            {tab === "pets" && <PetsTab />}
            {tab === "agendamentos" && <AppointmentsTab />}
            {tab === "pedidos" && <OrdersTab />}
            {tab === "dados" && <DataTab />}
          </section>
        </div>
      </div>
    </Layout>
  );
}

function PetsTab() {
  const [auth] = useAuth();
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<any | null>(null);

  const empty = { name: "", species: "Cachorro", breed: "", age: 0, weight: 0, history: "", photo: undefined as string | undefined };
  const [form, setForm] = useState(empty);

  useEffect(() => { loadPets(); }, []);

  const loadPets = async () => {
    try {
      const response = await fetch(
        `http://localhost/nobre-patinhas-api/listar_pets_usuario.php?usuario_id=${auth?.id}`
      );
      const data = await response.json();
      setPets(data);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const openNew = () => { setEditingPet(null); setForm(empty); setOpen(true); };

  const openEdit = (p: any) => {
    setEditingPet(p);
    setForm({ name: p.nome, species: p.especie, breed: p.raca, age: p.idade, weight: p.peso, history: p.historico ?? "", photo: p.foto ?? undefined });
    setOpen(true);
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Foto deve ter no máximo 2MB"); return; }
    setForm({ ...form, photo: await fileToDataUrl(file) });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPet) {
        // Editar pet existente
        const response = await fetch(
          "http://localhost/nobre-patinhas-api/editar_pet.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: editingPet.id,
              nome: form.name,
              especie: form.species,
              raca: form.breed,
              idade: form.age,
              peso: form.weight,
              historico: form.history,
              foto: form.photo,
            }),
          }
        );
        const data = await response.json();
        if (!data.success) { toast.error("Erro ao editar pet"); return; }
        toast.success("Pet atualizado!");
      } else {
        // Cadastrar novo pet
        const response = await fetch(
          "http://localhost/nobre-patinhas-api/cadastrar_pet.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              usuario_id: Number(auth!.id),
              nome: form.name,
              especie: form.species,
              raca: form.breed,
              idade: form.age,
              peso: form.weight,
              historico: form.history,
              foto: form.photo,
            }),
          }
        );
        const data = await response.json();
        if (!data.success) { toast.error("Erro ao cadastrar pet"); return; }
        toast.success("Pet cadastrado!");
      }
      await loadPets();
      setForm(empty);
      setOpen(false);
      setEditingPet(null);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao conectar ao servidor");
    }
  };

  const removePet = async (petId: number) => {
    try {
      const response = await fetch("http://localhost/nobre-patinhas-api/remover_pet.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pet_id: petId }),
      });
      const data = await response.json();
      if (!data.success) { toast.error("Erro ao remover pet"); return; }
      toast.success("Pet removido!");
      await loadPets();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao conectar ao servidor");
    }
  };

  if (loading) return <div className="rounded-xl border bg-card p-6 shadow-sm">Carregando pets...</div>;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Meus Pets</h2>
        <Button variant="action" onClick={openNew}><Plus /> Novo Pet</Button>
      </div>

      {open && (
        <form onSubmit={save} className="mb-6 grid gap-3 rounded-lg border bg-accent/20 p-4 md:grid-cols-2">
          <div className="flex flex-col items-center gap-2 md:col-span-2">
            <label className="group relative grid size-20 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-border bg-background hover:border-primary">
              {form.photo ? <img src={form.photo} alt="Pet" className="size-full object-cover" /> : <Camera className="size-6 text-muted-foreground group-hover:text-primary" />}
              <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
            </label>
            {form.photo ? (
              <button type="button" onClick={() => setForm({ ...form, photo: undefined })} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
                <X className="size-3" /> Remover foto
              </button>
            ) : <span className="text-xs text-muted-foreground">Foto do pet (opcional)</span>}
          </div>
          <Input label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Espécie</span>
            <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} className="h-10 w-full rounded-md border bg-background px-3">
              {["Cachorro", "Gato", "Pássaro", "Peixe", "Outro"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <Input label="Raça" value={form.breed} onChange={(v) => setForm({ ...form, breed: v })} />
          <Input label="Idade (anos)" type="number" value={String(form.age)} onChange={(v) => setForm({ ...form, age: Number(v) })} />
          <Input label="Peso (kg)" type="number" value={String(form.weight)} onChange={(v) => setForm({ ...form, weight: Number(v) })} />
          <label className="text-sm md:col-span-2">
            <span className="mb-1 block font-semibold">Histórico veterinário</span>
            <textarea value={form.history} onChange={(e) => setForm({ ...form, history: e.target.value })} rows={2} className="w-full rounded-md border bg-background p-2" />
          </label>
          <div className="flex gap-2 md:col-span-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setOpen(false); setEditingPet(null); }}>Cancelar</Button>
            <Button type="submit" variant="action" className="flex-1">{editingPet ? "Salvar alterações" : "Cadastrar"}</Button>
          </div>
        </form>
      )}

      {pets.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Você ainda não cadastrou pets.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {pets
            .filter((p) => !editingPet || p.id !== editingPet.id)
            .map((p) => (
              <li
                key={p.id}
                className={`flex items-start gap-3 rounded-lg border p-4 transition ${
                  editingPet ? "pointer-events-none opacity-40" : ""
                }`}
              >
                {p.foto ? (
                  <img src={p.foto} alt={p.nome} className="size-14 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="grid size-14 shrink-0 place-items-center rounded-full bg-accent text-primary">
                    <PawPrint className="size-6" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold">{p.nome} <span className="text-xs font-normal text-muted-foreground">· {p.especie}</span></p>
                  <p className="text-sm text-muted-foreground">{p.raca} · {p.idade} anos · {p.peso} kg</p>
                  {p.historico && <p className="mt-1 text-xs text-muted-foreground">{p.historico}</p>}
                </div>
                <div className="flex flex-col items-center justify-between self-stretch gap-2 py-1">
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded p-1 text-primary hover:bg-primary/10"
                    title="Editar pet"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => removePet(Number(p.id))}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                    title="Remover pet"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function AppointmentsTab() {
  const [auth] = useAuth();
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    banho: Bath, tosa: Scissors, consulta: Stethoscope, vacinacao: Syringe, hidratacao: Bubbles,
  };

  useEffect(() => {
    if (!auth?.id) return;
    loadAppointments();
  }, [auth?.id]);

  const loadAppointments = async () => {
    if (!auth?.id) return;
    try {
      const res = await fetch(
        `http://localhost/nobre-patinhas-api/listar_agendamentos_usuario.php?usuario_id=${auth.id}`
      );
      const data = await res.json();
      setAppts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: number) => {
    try {
      const res = await fetch(
        "http://localhost/nobre-patinhas-api/cancelar_agendamento.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        }
      );
      const data = await res.json();
      if (!data.success) { toast.error("Erro ao cancelar agendamento"); return; }
      toast.success("Agendamento cancelado!");
      setAppts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Erro ao conectar ao servidor");
    }
  };

  if (loading) return <div className="rounded-xl border bg-card p-6 shadow-sm">Carregando agendamentos...</div>;

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary">Agendamentos</h2>
        <Link to="/agendamento"><Button variant="action"><Plus /> Novo</Button></Link>
      </div>
      {appts.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Nenhum agendamento.</p>
      ) : (
        <ul className="space-y-3">
          {appts.map((a) => {
            const svc = SERVICES.find((s) => s.id === a.servico_id);
            const Icon = SERVICE_ICONS[a.servico_id] ?? Bath;
            return (
              <li key={a.id} className="flex items-start gap-4 rounded-lg border p-4">
                {/* Foto do pet ou ícone do serviço */}
                {a.pet_foto ? (
                  <img src={a.pet_foto} alt={a.pet_nome} className="size-14 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-7" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold">{svc?.name ?? a.servico_id}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.pet_nome} · {a.pet_raca}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.data_agendamento} às {a.horario}
                  </p>
                  {a.observacoes && (
                    <p className="mt-1 text-xs text-muted-foreground italic">"{a.observacoes}"</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase">
                    {a.status}
                  </span>
                  <button
                    onClick={() => cancelAppointment(a.id)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                    title="Cancelar agendamento"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function OrdersTab() {
  const [auth] = useAuth();

  const { products } = useProducts();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetch(
        `http://localhost/nobre-patinhas-api/listar_pedidos_usuario.php?usuario_id=${auth?.id}`
      );

      const data = await response.json();

      const pedidosComItens = await Promise.all(
        data.map(async (pedido: any) => {
          const itensResponse = await fetch(
            `http://localhost/nobre-patinhas-api/listar_itens_pedido.php?pedido_id=${pedido.id}`
          );

          const itens = await itensResponse.json();

          return {
            ...pedido,
            itens,
          };
        })
      );

      setOrders(pedidosComItens);

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        Carregando pedidos...
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-primary">
        Meus Pedidos
      </h2>

      {orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum pedido ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold">
                  Pedido #{o.id}
                </p>

                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase text-primary">
                  {o.status}
                </span>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(o.data_pedido).toLocaleString("pt-BR")}
              </p>

              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {o.itens.map((item: any, index: number) => (
                  <li key={index}>
                    {item.quantidade}x {item.name}
                  </li>
                ))}
              </ul>

              <p className="mt-2 text-right font-extrabold text-primary">
                {formatBRL(Number(o.total))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DataTab() {
  const [auth, setAuth] = useAuth();
  const [users, setUsers] = useUsers();
  const [name, setName] = useState(auth!.name);
  const [photo, setPhoto] = useState<string | undefined>(auth!.photo);
  const fileRef = useState<HTMLInputElement | null>(null);

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Foto deve ter no máximo 2MB"); return; }
    setPhoto(await fileToDataUrl(file));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nome obrigatório");
      return;
    }

    try {

      const response = await fetch(
        "http://localhost/nobre-patinhas-api/atualizar_usuario.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: auth!.id,
            nome: name.trim(),
            foto: photo,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        toast.error("Erro ao atualizar");
        return;
      }

      const updated = {
        ...auth!,
        name: name.trim(),
        photo,
      };

      setAuth(updated);

      toast.success("Dados atualizados!");

    } catch (error) {

      console.error(error);

      toast.error("Erro ao conectar ao servidor");

    }
  };

  const dirty = name !== auth!.name || photo !== auth!.photo;

  return (
    <form onSubmit={save} className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-primary">Meus Dados</h2>

      <div className="mb-6 flex flex-col items-center gap-3">
        <label className="group relative grid size-28 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-border bg-accent/30 hover:border-primary">
          {photo ? (
            <img src={photo} alt="Foto" className="size-full object-cover" />
          ) : (
            <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary">
              <Camera className="size-7" />
              <span className="mt-1 text-[10px] font-semibold uppercase">Adicionar</span>
            </div>
          )}
          <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
        </label>
        {photo && (
          <button type="button" onClick={() => setPhoto(undefined)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
            <X className="size-3" /> Remover foto
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Nome</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
        </label>
        <div className="text-sm">
          <span className="mb-1 block font-semibold">Email</span>
          <p className="flex h-10 items-center rounded-md border bg-muted/40 px-3 text-muted-foreground">{auth!.email}</p>
        </div>
        <div className="text-sm">
          <span className="mb-1 block font-semibold">Perfil</span>
          <p className="flex h-10 items-center rounded-md border bg-muted/40 px-3 capitalize text-muted-foreground">{auth!.role}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" variant="action" disabled={!dirty}>Salvar alterações</Button>
      </div>
      {/* keep ref var unused warning down */}
      <span className="hidden">{String(!!fileRef)}</span>
    </form>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
    </label>
  );
}
