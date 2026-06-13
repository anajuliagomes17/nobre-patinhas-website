import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Cadastre-se — Nobre Patinhas" }] }),
  component: Cadastro,
});

function Cadastro() {
  const [, setAuth] = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {

      const response = await fetch(
        "http://localhost/nobre-patinhas-api/cadastrar_usuario.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!data.success) {
        toast.error("Erro ao cadastrar usuário");
        return;
      }

      const user = {
        id: String(data.id),
        ...form,
        role: "cliente" as const
      };

      setAuth(user);

      toast.success("Cadastro realizado!");
      navigate({ to: "/conta" });

    } catch (error) {

      console.error(error);

      toast.error("Erro ao conectar com servidor");

    }
  };
  
  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-12 md:px-6">
        <form onSubmit={submit} className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <PawPrint className="size-7 text-primary" />
            <h1 className="text-2xl font-extrabold text-primary">Criar conta</h1>
          </div>

          <p className="mb-6 text-sm text-muted-foreground">
            Você poderá adicionar uma foto de perfil depois, na sua conta.
          </p>

          {[
            { k: "name", label: "Nome completo", type: "text" },
            { k: "email", label: "Email", type: "email" },
            { k: "password", label: "Senha", type: "password" },
          ].map((f) => (
            <label key={f.k} className="mb-4 block text-sm">
              <span className="mb-1 block font-semibold">{f.label}</span>
              <input required type={f.type} value={(form as Record<string, string>)[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} className="h-11 w-full rounded-md border bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary" />
            </label>
          ))}
          <Button type="submit" variant="action" size="lg" className="w-full rounded-full">Cadastrar</Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Já tem conta? <Link to="/login" className="font-bold text-primary hover:underline">Entrar</Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}