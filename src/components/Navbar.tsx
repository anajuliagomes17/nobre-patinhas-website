import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, LineChart, Menu, X, PawPrint, User as UserIcon, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth, useCart } from "@/lib/store";

export function Navbar() {
  const [auth, setAuth] = useAuth();
  const [cart] = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const count = cart.reduce((n, i) => n + i.qty, 0);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/produtos", search: { q } as never });
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <PawPrint className="size-7 text-action" strokeWidth={2.5} />
          <span className="text-xl font-extrabold tracking-tight">
            Nobre <span className="text-action">Patinhas</span>
          </span>
        </Link>

        <form onSubmit={onSearch} className="relative mx-auto hidden max-w-xl flex-1 md:block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="O que seu pet precisa hoje?"
            className="h-10 w-full rounded-full bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-action"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-2 md:flex">
          <Link to="/carrinho" className="relative flex items-center gap-2 rounded-md px-3 py-2 hover:bg-white/10">
            <ShoppingCart className="size-5" />
            <span className="text-sm font-semibold">Carrinho</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-action text-[10px] font-bold text-action-foreground">{count}</span>
            )}
          </Link>
          {auth ? (
            <>
              <Link to="/conta">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                  <UserIcon /> {auth.name.split(" ")[0]}
                </Button>
              </Link>
              {(auth.role === "admin" || auth.role === "repositor") && (
                <Link to="/admin">
                  <Button variant="action" size="sm"><LineChart /> Painel</Button>
                </Link>
              )}
              {(auth.role === "funcionario" || auth.role === "admin") && (
                <Link to="/atendimento">
                  <Button variant="action" size="sm">Atendimento</Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={() => { setAuth(null); navigate({ to: "/" }); }} className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                <LogOut />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">Entrar</Button></Link>
              <Link to="/cadastro"><Button variant="action" size="sm">Cadastre-se</Button></Link>
            </>
          )}
        </nav>

        <button onClick={() => setOpen(true)} className="ml-auto rounded-md p-2 hover:bg-white/10 md:hidden" aria-label="Menu">
          <Menu className="size-6" />
        </button>
      </div>

      <form onSubmit={onSearch} className="relative px-4 pb-3 md:hidden">
        <Search className="pointer-events-none absolute left-7 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="O que seu pet precisa?" className="h-10 w-full rounded-full bg-white pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
      </form>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setOpen(false)}>
          <aside className="ml-auto flex h-full w-72 flex-col gap-2 bg-background p-4 text-foreground" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2">
              <span className="font-bold text-primary">Menu</span>
              <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-muted"><X className="size-5" /></button>
            </div>
            {[
              { to: "/", label: "Home" },
              { to: "/produtos", label: "Produtos" },
              { to: "/agendamento", label: "Agendamento" },
              { to: "/carrinho", label: "Carrinho" },
              { to: "/conta", label: "Minha Conta" },
              { to: "/chat", label: "Chat Online" },
              { to: "/contato", label: "Contato" },
              { to: "/admin", label: "Painel Admin" },
            ].map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm hover:bg-muted">{l.label}</Link>
            ))}
            <div className="mt-auto flex flex-col gap-2 pt-4">
              {auth ? (
                <Button onClick={() => { setAuth(null); setOpen(false); }} variant="outline"><LogOut /> Sair</Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)}><Button variant="outline" className="w-full">Entrar</Button></Link>
                  <Link to="/cadastro" onClick={() => setOpen(false)}><Button variant="action" className="w-full">Cadastre-se</Button></Link>
                </>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
