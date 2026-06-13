import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import {
  useAuth,
  useStockOverrides,
  useProducts,
  useProductEdits,
  useCustomProducts,
  useDeletedProducts,
  uid,
  fileToDataUrl,
} from "@/lib/store";
import type { Product, Category, Species } from "@/lib/seed";
import { formatBRL } from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Minus,
  Plus,
  AlertTriangle,
  Pencil,
  Trash2,
  Camera,
  X,
  PawPrint,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/estoque")({
  head: () => ({ meta: [{ title: "Estoque — Nobre Patinhas" }] }),
  component: Estoque,
});

const CATEGORIES: Category[] = ["racoes", "acessorios", "brinquedos", "higiene", "medicamentos", "roupas"];
const SPECIES_LIST: Species[] = ["cachorros", "gatos", "passaros", "peixes", "outros"];

type FormState = Omit<Product, "id"> & { id?: string };
const emptyForm: FormState = {
  name: "",
  brand: "",
  price: 0,
  category: "racoes",
  species: "cachorros",
  description: "",
  stock: 0,
  image: undefined,
};

function Estoque() {
  const [auth] = useAuth(); 
  console.log("AUTH:", auth);
  const navigate = useNavigate();
  const [overrides, setOverrides] = useStockOverrides();
  const {
    products,
    reloadProducts
  } = useProducts();
  const [edits, setEdits] = useProductEdits();
  const [custom, setCustom] = useCustomProducts();
  const [deleted, setDeleted] = useDeletedProducts();
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState<FormState | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCheckingAuth(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {

    if (checkingAuth) return;

    if (!auth) {
      navigate({ to: "/login" });
      return;
    }

    if (
      auth.role === "cliente" ||
      auth.role === "funcionario"
    ) {
      navigate({ to: "/login" });
    }

  }, [auth, navigate, checkingAuth]);

  if (checkingAuth) {
    return <div>Carregando...</div>;
  }

  if (!auth) {
    return null;
  }

  const stockOf = (_id: string, stock: number) => stock;
  const setStock = async (id: string, v: number) => {

    const stock = Math.max(0, v);

    try {

      const response = await fetch(
        "http://localhost/nobre-patinhas-api/atualizar_estoque.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id,
            stock
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        await reloadProducts();
      } else {
        toast.error("Erro ao atualizar estoque");
      }

    } catch (error) {

      console.error(error);
      toast.error("Erro de conexão");

    }
  };

  const filtered = products.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(filter.toLowerCase()));

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!form) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Imagem deve ter no máximo 2MB"); return; }
    setForm({ ...form, image: await fileToDataUrl(file) });
  };

  const openNew = () => setForm({ ...emptyForm });
  const openEdit = (p: Product) => setForm({ ...p });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim() || !form.brand.trim() || form.price <= 0) {
      toast.error("Preencha nome, marca e preço");
      return;
    }

    if (form.id) {

      const response = await fetch(
        "http://localhost/nobre-patinhas-api/editar_produto.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const result = await response.json();

      if(result.success){
        toast.success("Produto atualizado!");
        await reloadProducts();
        setForm(null);
      } else {
        toast.error("Erro ao atualizar produto");
      }

    } else {

      const response = await fetch(
        "http://localhost/nobre-patinhas-api/cadastrar_produto.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const result = await response.json();

      if(result.success){
        toast.success("Produto cadastrado no banco!");
        await reloadProducts();
        setForm(null);
      } else {
        toast.error("Erro ao cadastrar");
      }
    }
    setForm(null);
  };

  const remove = async (p: Product) => {

    if (!confirm(`Excluir "${p.name}"?`)) {
      return;
    }

    try {

      const response = await fetch(
        "http://localhost/nobre-patinhas-api/excluir_produto.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            id: p.id
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success("Produto excluído!");
        await reloadProducts();
      } else {
        toast.error("Erro ao excluir produto");
      }

    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão");
    }

  };

  return (
    <Layout>
      <PageHeader title="Controle de Estoque" subtitle="Cadastre, edite, exclua produtos e ajuste quantidades." />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Link to="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> Voltar ao painel
        </Link>

        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar produto..."
              className="h-10 w-full max-w-sm rounded-md border bg-background px-3 text-sm"
            />
            <div className="flex gap-2">
              {deleted.length > 0 && (
                <Button variant="outline" onClick={() => { setDeleted([]); toast.success("Excluídos restaurados"); }}>
                  Restaurar excluídos ({deleted.length})
                </Button>
              )}
              <Button variant="action" onClick={openNew}><Plus /> Novo Produto</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-accent/30 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Produto</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Preço</th>
                  <th className="p-3">Estoque</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const s = stockOf(p.id, p.stock);
                  return (
                    <tr key={p.id} className="border-t">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="size-10 rounded object-cover" />
                          ) : (
                            <div className="grid size-10 place-items-center rounded bg-accent/40 text-primary/60"><PawPrint className="size-4" /></div>
                          )}
                          <div>
                            <div className="font-semibold">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 capitalize text-muted-foreground">{p.category}</td>
                      <td className="p-3 font-bold text-primary">{formatBRL(p.price)}</td>
                      <td className="p-3">
                        <div className="inline-flex items-center rounded-full border">
                          <button onClick={() => setStock(p.id, s - 1)} className="px-2 py-1 text-primary hover:bg-accent"><Minus className="size-3" /></button>
                          <span className="min-w-10 px-2 text-center font-bold">{s}</span>
                          <button onClick={() => setStock(p.id, s + 1)} className="px-2 py-1 text-primary hover:bg-accent"><Plus className="size-3" /></button>
                        </div>
                      </td>
                      <td className="p-3">
                        {s === 0 ? <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">Sem estoque</span>
                          : s < 10 ? <span className="inline-flex items-center gap-1 rounded-full bg-action/30 px-2 py-0.5 text-xs font-bold text-action-foreground"><AlertTriangle className="size-3" /> Baixo</span>
                          : <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">OK</span>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-1">
                          <button onClick={() => openEdit(p)} className="rounded p-2 text-primary hover:bg-accent" aria-label="Editar"><Pencil className="size-4" /></button>
                          <button onClick={() => remove(p)} className="rounded p-2 text-destructive hover:bg-destructive/10" aria-label="Excluir"><Trash2 className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setForm(null)}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-card p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-primary">{form.id ? "Editar Produto" : "Novo Produto"}</h2>
              <button type="button" onClick={() => setForm(null)} className="rounded p-1 hover:bg-muted"><X className="size-5" /></button>
            </div>

            <div className="mb-4 flex flex-col items-center gap-2">
              <label className="group relative grid size-32 cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-accent/30 hover:border-primary">
                {form.image ? (
                  <img src={form.image} alt="Produto" className="size-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-primary">
                    <Camera className="size-6" />
                    <span className="text-xs">Imagem</span>
                  </div>
                )}
                <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
              </label>
              {form.image && (
                <button type="button" onClick={() => setForm({ ...form, image: undefined })} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
                  <X className="size-3" /> Remover imagem
                </button>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Marca" value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
              <Field label="Preço (R$)" type="number" value={String(form.price)} onChange={(v) => setForm({ ...form, price: Number(v) })} />
              <Field label="Estoque" type="number" value={String(form.stock)} onChange={(v) => setForm({ ...form, stock: Number(v) })} />
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Categoria</span>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="h-10 w-full rounded-md border bg-background px-3 capitalize">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Espécie</span>
                <select value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value as Species })} className="h-10 w-full rounded-md border bg-background px-3 capitalize">
                  {SPECIES_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="text-sm md:col-span-2">
                <span className="mb-1 block font-semibold">Descrição</span>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-md border bg-background p-2" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setForm(null)}>Cancelar</Button>
              <Button type="submit" variant="action">{form.id ? "Salvar alterações" : "Cadastrar produto"}</Button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-semibold">{label}</span>
      <input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
    </label>
  );
}
