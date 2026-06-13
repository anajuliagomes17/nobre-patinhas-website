import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { useCart, useProducts } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/components/ProductCard";
import { Trash2, PawPrint, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/carrinho")({
  head: () => ({ meta: [{ title: "Carrinho — Nobre Patinhas" }] }),
  component: Carrinho,
});

function Carrinho() {
  const [cart, setCart] = useCart();
  const { products } = useProducts();
  const items = cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.productId)! })).filter((i) => i.product);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = subtotal > 200 ? 0 : subtotal > 0 ? 19.9 : 0;
  const total = subtotal + shipping;

  const setQty = (id: string, qty: number) => setCart(cart.map((c) => c.productId === id ? { ...c, qty: Math.max(1, qty) } : c));
  const remove = (id: string) => setCart(cart.filter((c) => c.productId !== id));

  return (
    <Layout>
      <PageHeader title="Meu Carrinho" subtitle={`${items.length} item(s)`} />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {items.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-bold">Seu carrinho está vazio</h2>
            <p className="mt-2 text-muted-foreground">Que tal dar uma olhada nos nossos produtos?</p>
            <Link to="/produtos"><Button variant="action" className="mt-6 rounded-full">Ir para a loja</Button></Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {items.map((i) => (
                <div key={i.productId} className="flex gap-4 rounded-xl border bg-card p-4 shadow-sm">
                  <div className="grid size-24 shrink-0 place-items-center rounded-lg bg-accent/30 text-primary/70"><PawPrint className="size-8" /></div>
                  <div className="flex flex-1 flex-col">
                    <Link to="/produto/$id" params={{ id: i.product.id }} className="text-sm font-bold hover:text-primary">{i.product.name}</Link>
                    <p className="text-xs text-muted-foreground">{i.product.brand}</p>
                    <p className="mt-1 text-lg font-extrabold text-primary">{formatBRL(i.product.price)}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border">
                        <button onClick={() => setQty(i.productId, i.qty - 1)} className="px-3 py-1 font-bold text-primary hover:bg-accent">−</button>
                        <span className="min-w-8 text-center font-bold">{i.qty}</span>
                        <button onClick={() => setQty(i.productId, i.qty + 1)} className="px-3 py-1 font-bold text-primary hover:bg-accent">+</button>
                      </div>
                      <button onClick={() => remove(i.productId)} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <aside className="h-fit rounded-xl border bg-card p-6 shadow-sm md:sticky md:top-24">
              <h3 className="mb-4 font-bold text-primary">Resumo do Pedido</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatBRL(subtotal)}</dd></div>
                <div className="flex justify-between"><dt>Frete</dt><dd>{shipping === 0 ? "Grátis" : formatBRL(shipping)}</dd></div>
                <div className="mt-3 flex justify-between border-t pt-3 text-lg font-extrabold text-primary"><dt>Total</dt><dd>{formatBRL(total)}</dd></div>
              </dl>
              <Link to="/checkout"><Button variant="action" size="lg" className="mt-6 w-full rounded-full">Finalizar Compra</Button></Link>
              <Link to="/produtos" className="mt-3 block text-center text-sm text-muted-foreground hover:text-primary">Continuar comprando</Link>
            </aside>
          </div>
        )}
      </div>
    </Layout>
  );
}
