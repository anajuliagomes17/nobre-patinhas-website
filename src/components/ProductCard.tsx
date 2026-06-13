import { Link } from "@tanstack/react-router";
import { ShoppingBag, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/lib/store";
import type { Product } from "@/lib/seed";
import { toast } from "sonner";

export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function ProductCard({ product }: { product: Product }) {
  const [cart, setCart] = useCart();

  const add = () => {
    const exists = cart.find((c) => c.productId === product.id);
    const next: CartItem[] = exists
      ? cart.map((c) => (c.productId === product.id ? { ...c, qty: c.qty + 1 } : c))
      : [...cart, { productId: product.id, qty: 1 }];
    setCart(next);
    toast.success("Adicionado ao carrinho", { description: product.name });
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link to="/produto/$id" params={{ id: product.id }} className="block">
        <div className="grid aspect-square place-items-center overflow-hidden bg-accent/30">
          {product.image ? (
            <img src={product.image} alt={product.name} className="size-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-primary/70">
              <PawPrint className="size-10" strokeWidth={2} />
              <span className="text-sm font-bold">Nobre Patinhas</span>
            </div>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to="/produto/$id" params={{ id: product.id }} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-foreground hover:text-primary">
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <p className="text-xl font-extrabold text-primary">
          <span className="text-xs font-bold text-muted-foreground">R$ </span>
          {product.price.toFixed(2).replace(".", ",")}
        </p>
        <Button onClick={add} variant="action" className="mt-auto w-full rounded-full">
          <ShoppingBag /> Comprar
        </Button>
      </div>
    </article>
  );
}
