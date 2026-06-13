import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Nobre Patinhas" }] }),
  component: Login,
});

function Login() {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth) return;
    if (auth.role === "cliente") navigate({ to: "/conta" });
    else if (auth.role === "funcionario") navigate({ to: "/atendimento" });
    else navigate({ to: "/admin" });
  }, [auth, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "http://localhost/nobre-patinhas-api/login.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      const user = data.user;
      setAuth(user);
      toast.success(`Bem-vindo(a), ${user.name}!`);

      if (user.role === "cliente") navigate({ to: "/conta" });
      else if (user.role === "funcionario") navigate({ to: "/atendimento" });
      else navigate({ to: "/admin" });

    } catch (error) {
      console.error(error);
      toast.error("Erro ao conectar ao servidor");
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-12 md:px-6">
        <form onSubmit={submit} className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <PawPrint className="size-7 text-primary" />
            <h1 className="text-2xl font-extrabold text-primary">Entrar</h1>
          </div>
          <label className="mb-4 block text-sm">
            <span className="mb-1 block font-semibold">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-md border bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="voce@email.com"
            />
          </label>
          <label className="mb-6 block text-sm">
            <span className="mb-1 block font-semibold">Senha</span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-md border bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </label>
          <Button type="submit" variant="action" size="lg" className="w-full rounded-full">
            Entrar
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/cadastro" className="font-bold text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}