import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contato")({
  head: () => ({ meta: [{ title: "Contato — Nobre Patinhas" }] }),
  component: Contato,
});

function Contato() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => { e.preventDefault(); toast.success("Mensagem enviada! Retornaremos em breve."); setForm({ name: "", email: "", message: "" }); };
  return (
    <Layout>
      <PageHeader title="Fale Conosco" subtitle="Estamos aqui para cuidar do seu pet." />
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 md:grid-cols-2 md:px-6">
        <form onSubmit={submit} className="rounded-2xl border bg-card p-6 shadow-sm">
          <label className="mb-3 block text-sm"><span className="mb-1 block font-semibold">Nome</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10 w-full rounded-md border bg-background px-3" />
          </label>
          <label className="mb-3 block text-sm"><span className="mb-1 block font-semibold">Email</span>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10 w-full rounded-md border bg-background px-3" />
          </label>
          <label className="mb-4 block text-sm"><span className="mb-1 block font-semibold">Mensagem</span>
            <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-md border bg-background p-3" />
          </label>
          <Button type="submit" variant="action" className="w-full rounded-full">Enviar</Button>
        </form>
        <aside className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-primary">Outras formas de contato</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3"><Phone className="size-5 text-primary" /> (11) 99999-9999</li>
            <li className="flex items-center gap-3"><Mail className="size-5 text-primary" /> contato@nobrepatinhas.com</li>
            <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-primary" /> Rua dos Pets, 123 — Centro, São Paulo/SP</li>
          </ul>
          <a href="https://wa.me/5511999999999" className="mt-6 block"><Button variant="action" className="w-full rounded-full"><Phone /> WhatsApp</Button></a>
        </aside>
      </div>
    </Layout>
  );
}
