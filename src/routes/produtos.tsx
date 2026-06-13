import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { SpeciesNav } from "@/components/SpeciesNav";
import { ProductCard } from "@/components/ProductCard";
import { type Category } from "@/lib/seed";
import { useProducts } from "@/lib/store";
import { Filter } from "lucide-react";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/produtos")({
  head: () => ({ meta: [{ title: "Produtos — Nobre Patinhas" }, { name: "description", content: "Loja completa: rações, brinquedos, acessórios, higiene e mais." }] }),
  validateSearch: searchSchema,
  component: Produtos,
});

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "racoes", label: "Rações / Alimentos" },
  { id: "acessorios", label: "Acessórios" },
  { id: "brinquedos", label: "Brinquedos" },
  { id: "higiene", label: "Higiene" },
  { id: "medicamentos", label: "Medicamentos" },
  { id: "roupas", label: "Roupas" },
];

function Produtos() {
  const { q } = Route.useSearch();
  const { products: allProducts } = useProducts();
  const [species, setSpecies] = useState("todos");
  const [cats, setCats] = useState<Set<Category>>(new Set());
  const [price, setPrice] = useState<"todos" | "ate100" | "acima100">("todos");
  const [search, setSearch] = useState(q ?? "");

  const products = useMemo(() => allProducts.filter((p) => {
    if (species !== "todos" && p.species !== species) return false;
    if (cats.size && !cats.has(p.category)) return false;
    if (price === "ate100" && p.price > 100) return false;
    if (price === "acima100" && p.price <= 100) return false;
    if (search && !`${p.name} ${p.brand}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [allProducts, species, cats, price, search]);

  const toggleCat = (c: Category) => {
    const n = new Set(cats);
    n.has(c) ? n.delete(c) : n.add(c);
    setCats(n);
  };

  return (
    <Layout>
      <SpeciesNav value={species} onChange={setSpecies} />
      <div className="mx-auto max-w-7xl px-4 pb-12 md:px-6">
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <aside className="rounded-xl border bg-card p-5 shadow-sm md:sticky md:top-24 md:h-fit">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-primary"><Filter className="size-4" /> Refinar Busca</h3>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className="mb-4 h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo de Item</p>
            <ul className="mb-4 space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" checked={cats.has(c.id)} onChange={() => toggleCat(c.id)} className="size-4 accent-primary" />
                    {c.label}
                  </label>
                </li>
              ))}
            </ul>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Preço</p>
            <ul className="space-y-2">
              {[
                { id: "todos", label: "Todos" },
                { id: "ate100", label: "Até R$ 100,00" },
                { id: "acima100", label: "Acima de R$ 100,00" },
              ].map((o) => (
                <li key={o.id}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="radio" name="price" checked={price === o.id} onChange={() => setPrice(o.id as typeof price)} className="size-4 accent-primary" />
                    {o.label}
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            <p className="mb-4 text-sm text-muted-foreground">{products.length} produto(s) encontrado(s)</p>
            {products.length === 0 ? (
              <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">Nenhum produto encontrado.</div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}


