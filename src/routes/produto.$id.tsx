import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useCart, useProducts, type CartItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/components/ProductCard";
import { PawPrint, ShoppingBag, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/produto/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);
  const [cart, setCart] = useCart();
  const [qty, setQty] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
  if (product) {
    document.title = `${product.name} — Nobre Patinhas`;
  } else {
    document.title = "Produto — Nobre Patinhas";
  }
}, [product]);

  if (!product) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold">Produto não encontrado</h1>
          <Link to="/produtos" className="mt-4 inline-block text-primary hover:underline">Voltar à loja</Link>
        </div>
      </Layout>
    );
  }

  const add = (go = false) => {
    const exists = cart.find((c) => c.productId === product.id);
    const next: CartItem[] = exists
      ? cart.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + qty } : c))
      : [...cart, { productId: product.id, qty }];
    setCart(next);
    toast.success("Adicionado ao carrinho");
    if (go) navigate({ to: "/carrinho" });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Link to="/produtos" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Voltar à loja</Link>
        <div className="grid gap-8 rounded-2xl border bg-card p-6 shadow-sm md:grid-cols-2 md:p-10">
          <div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-accent/30">
            {product.image ? (
              <img src={product.image} alt={product.name} className="size-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-primary/70">
                <PawPrint className="size-20" strokeWidth={1.8} />
                <span className="text-lg font-bold">Nobre Patinhas</span>
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{product.brand}</p>
            <h1 className="mt-1 text-2xl font-extrabold text-foreground md:text-3xl">{product.name}</h1>
            <p className="mt-4 text-3xl font-extrabold text-primary">{formatBRL(product.price)}</p>
            <p className="mt-1 text-xs text-muted-foreground">ou 3x de {formatBRL(product.price / 3)} sem juros</p>

            <p className="mt-6 text-sm leading-relaxed text-foreground/80">{product.description}</p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-full border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-2 text-lg font-bold text-primary hover:bg-accent">−</button>
                <span className="min-w-10 text-center font-bold">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-4 py-2 text-lg font-bold text-primary hover:bg-accent">+</button>
              </div>
              <span className="text-xs text-muted-foreground">{product.stock} em estoque</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => add(false)} variant="action" size="lg" className="rounded-full"><ShoppingBag /> Adicionar ao Carrinho</Button>
              <Button onClick={() => add(true)} size="lg" className="rounded-full">Comprar Agora</Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t pt-6 text-center text-xs text-muted-foreground">
              <div className="flex flex-col items-center gap-1"><Truck className="size-5 text-primary" /> Entrega rápida</div>
              <div className="flex flex-col items-center gap-1"><Shield className="size-5 text-primary" /> Compra segura</div>
              <div className="flex flex-col items-center gap-1"><RotateCcw className="size-5 text-primary" /> Troca fácil</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
