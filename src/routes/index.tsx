import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { SpeciesNav } from "@/components/SpeciesNav";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SERVICES, TESTIMONIALS } from "@/lib/seed";
import { useProducts } from "@/lib/store";
import { Calendar, ShoppingBag, Bubbles, Stethoscope, Syringe, Bath, Scissors, Star, ChevronLeft, ChevronRight, Shield, Heart, Award } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nobre Patinhas — Pet Shop com carinho, atenção e confiança" },
      { name: "description", content: "Loja, banho, tosa, consultas e agendamento online no Nobre Patinhas. Tudo para o seu pet em um só lugar." },
      { property: "og:title", content: "Nobre Patinhas — Pet Shop" },
      { property: "og:description", content: "Loja, banho, tosa, consultas e agendamento online." },
    ],
  }),
  component: Home,
});

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  banho: Bath, tosa: Scissors, consulta: Stethoscope, vacinacao: Syringe, hidratacao: Bubbles,
};

function Home() {
  const [species, setSpecies] = useState("todos");
  const [testimonial, setTestimonial] = useState(0);
  const { products } = useProducts();
  const filtered = species === "todos" ? products : products.filter((p) => p.species === species);
  const featured = filtered.slice(0, 8);

  return (
    <Layout>
      <SpeciesNav value={species} onChange={setSpecies} />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
        <div className="relative overflow-hidden rounded-2xl brand-gradient p-8 text-primary-foreground shadow-xl md:p-14">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-3 inline-block rounded-full bg-action px-3 py-1 text-xs font-bold text-action-foreground">SEU PET MERECE O MELHOR</p>
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
              Cuidado, carinho e confiança<br /> para quem você ama.
            </h1>
            <p className="mt-4 text-base text-primary-foreground/90 md:text-lg">
              Banho, tosa, veterinário e uma loja completa — tudo num só lugar, com agendamento online.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/agendamento"><Button variant="action" size="lg" className="rounded-full"><Calendar /> Agendar Atendimento</Button></Link>
              <Link to="/produtos"><Button size="lg" variant="outline" className="rounded-full bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"><ShoppingBag /> Comprar Agora</Button></Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-10 -right-10 hidden text-[280px] leading-none opacity-20 md:block">🐾</div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-10 md:grid-cols-3 md:px-6">
        {[
          { Icon: Shield, t: "Profissionais certificados", d: "Veterinários e tosadores qualificados." },
          { Icon: Heart, t: "Atendimento com carinho", d: "Tratamos cada pet como família." },
          { Icon: Award, t: "Loja com curadoria", d: "Só as melhores marcas para o seu pet." },
        ].map(({ Icon, t, d }) => (
          <div key={t} className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-action/20 text-primary"><Icon className="size-5" /></div>
            <div><p className="font-bold text-foreground">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
          </div>
        ))}
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">Nossos Serviços</h2>
            <p className="text-sm text-muted-foreground">Cuidado completo do começo ao fim.</p>
          </div>
          <Link to="/agendamento" className="hidden text-sm font-bold text-primary hover:underline md:inline">Agendar →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {SERVICES.map((s) => {
            const Icon = SERVICE_ICONS[s.id] ?? Bath;
            return (
              <Link key={s.id} to="/agendamento" className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-md">
                <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="size-7" /></span>
                <span className="text-sm font-bold text-foreground">{s.name}</span>
                <span className="text-xs text-muted-foreground">a partir de R$ {s.price}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">Produtos em Destaque</h2>
            <p className="text-sm text-muted-foreground">Selecionados especialmente para o seu pet.</p>
          </div>
          <Link to="/produtos" className="hidden text-sm font-bold text-primary hover:underline md:inline">Ver todos →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Schedule CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-action p-8 text-center text-action-foreground shadow-md md:flex-row md:p-12 md:text-left">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">Agende um banho relaxante</h2>
            <p className="mt-2 max-w-xl text-sm md:text-base">Reserve em menos de 1 minuto. Receba lembretes e cuide do seu pet sem complicação.</p>
          </div>
          <Link to="/agendamento"><Button size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"><Calendar /> Agendar Agora</Button></Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <h2 className="mb-6 text-2xl font-extrabold text-foreground md:text-3xl">O que dizem nossos clientes</h2>
        <div className="relative rounded-2xl border bg-card p-8 shadow-sm">
          {(() => {
            const t = TESTIMONIALS[testimonial];
            return (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-primary text-2xl font-extrabold text-primary-foreground">{t.avatar}</div>
                <div className="flex gap-1 text-action">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
                </div>
                <p className="max-w-2xl text-lg italic text-foreground">"{t.comment}"</p>
                <p className="font-bold text-primary">{t.name}</p>
              </div>
            );
          })()}
          <button onClick={() => setTestimonial((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-card p-2 shadow hover:bg-accent" aria-label="Anterior"><ChevronLeft className="size-5" /></button>
          <button onClick={() => setTestimonial((i) => (i + 1) % TESTIMONIALS.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-card p-2 shadow hover:bg-accent" aria-label="Próximo"><ChevronRight className="size-5" /></button>
          <div className="mt-4 flex justify-center gap-1">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setTestimonial(i)} className={`h-2 rounded-full transition-all ${i === testimonial ? "w-6 bg-primary" : "w-2 bg-border"}`} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
