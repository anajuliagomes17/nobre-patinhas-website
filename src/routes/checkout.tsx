import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { useCart, useAuth, useProducts } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/components/ProductCard";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Finalizar Compra — Nobre Patinhas" }] }),
  component: Checkout,
});

function Checkout() {
  const [cart, setCart] = useCart();
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [done, setDone] = useState<string | null>(null);
  const [form, setForm] = useState({ name: auth?.name ?? "", cep: "", address: "", city: "", payment: "pix" });

  const { products } = useProducts();
  const items = cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.productId)! })).filter((i) => i.product);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = subtotal > 200 ? 0 : 19.9;
  const total = subtotal + shipping;

  if (items.length === 0 && !done) {
    return <Layout><div className="mx-auto max-w-xl py-20 text-center"><p>Carrinho vazio.</p><Link to="/produtos" className="text-primary">Ir à loja</Link></div></Layout>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth) {
      toast.error("Faça login para finalizar");
      navigate({ to: "/login" });
      return;
    }

    try {

      const response = await fetch(
        "http://localhost/nobre-patinhas-api/criar_pedido.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario_id: Number(auth.id),
            total,
            itens: items.map((i) => ({
              productId: Number(i.product.id),
              qty: i.qty,
              price: i.product.price,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        toast.error("Erro ao criar pedido");
        return;
      }

      setCart([]);

      toast.success("Pedido realizado!");

      setDone(String(data.pedido_id));

    } catch (error) {

      console.error(error);

      toast.error("Erro ao conectar ao servidor");

    }
  };

  if (done) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <CheckCircle2 className="mx-auto size-16 text-primary" />
          <h1 className="mt-4 text-3xl font-extrabold text-foreground">Pedido confirmado!</h1>
          <p className="mt-2 text-muted-foreground">Pedido <strong>#{done.toUpperCase()}</strong> recebido com sucesso.</p>
          <p className="mt-1 text-sm text-muted-foreground">Você pode acompanhar o status na sua conta.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/conta"><Button>Minha Conta</Button></Link>
            <Link to="/produtos"><Button variant="outline">Continuar Comprando</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader title="Finalizar Compra" />
      <form onSubmit={submit} className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1fr_380px] md:px-6">
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-primary">Entrega</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Nome completo" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="CEP" value={form.cep} onChange={(v) => setForm({ ...form, cep: v })} />
              <div className="md:col-span-2"><Field label="Endereço" value={form.address} onChange={(v) => setForm({ ...form, address: v })} /></div>
              <Field label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            </div>
          </section>
          <section className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="mb-4 font-bold text-primary">Pagamento</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { id: "pix", label: "PIX (5% off)" },
                { id: "credito", label: "Cartão de Crédito" },
                { id: "boleto", label: "Boleto" },
              ].map((p) => (
                <label key={p.id} className={`cursor-pointer rounded-lg border-2 p-4 text-center text-sm font-bold transition ${form.payment === p.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50"}`}>
                  <input type="radio" name="pay" className="sr-only" checked={form.payment === p.id} onChange={() => setForm({ ...form, payment: p.id })} />
                  {p.label}
                </label>
              ))}
            </div>
          </section>
        </div>
        <aside className="h-fit rounded-xl border bg-card p-6 shadow-sm md:sticky md:top-24">
          <h3 className="mb-4 font-bold text-primary">Resumo</h3>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-2">
                <span className="line-clamp-1">{i.qty}× {i.product.name}</span>
                <span className="shrink-0 font-semibold">{formatBRL(i.product.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatBRL(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Frete</dt><dd>{shipping === 0 ? "Grátis" : formatBRL(shipping)}</dd></div>
            <div className="mt-2 flex justify-between border-t pt-2 text-lg font-extrabold text-primary"><dt>Total</dt><dd>{formatBRL(total)}</dd></div>
          </dl>
          <Button type="submit" variant="action" size="lg" className="mt-6 w-full rounded-full">Confirmar Pedido</Button>
        </aside>
      </form>
    </Layout>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-foreground">{label}</span>
      <input required value={value} onChange={(e) => onChange(e.target.value)} className="h-10 w-full rounded-md border bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
    </label>
  );
}
