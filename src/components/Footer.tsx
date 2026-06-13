import { Link } from "@tanstack/react-router";
import { PawPrint, Facebook, Instagram, Phone, MapPin, Clock, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <PawPrint className="size-7 text-action" strokeWidth={2.5} />
            <span className="text-xl font-extrabold">Nobre <span className="text-action">Patinhas</span></span>
          </div>
          <p className="mt-3 text-sm text-primary-foreground/80">
            Cuidando do seu melhor amigo com carinho, atenção e confiança desde 2010.
          </p>
          <div className="mt-4 flex gap-3">
            <a href="#" aria-label="Facebook" className="rounded-full bg-white/10 p-2 hover:bg-action hover:text-action-foreground"><Facebook className="size-4" /></a>
            <a href="#" aria-label="Instagram" className="rounded-full bg-white/10 p-2 hover:bg-action hover:text-action-foreground"><Instagram className="size-4" /></a>
            <a href="https://wa.me/5511999999999" aria-label="WhatsApp" className="rounded-full bg-white/10 p-2 hover:bg-action hover:text-action-foreground"><Phone className="size-4" /></a>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-action">Links Úteis</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/produtos" className="hover:text-action">Loja</Link></li>
            <li><Link to="/agendamento" className="hover:text-action">Agendamento</Link></li>
            <li><Link to="/conta" className="hover:text-action">Minha Conta</Link></li>
            <li><Link to="/contato" className="hover:text-action">Contato</Link></li>
            <li><Link to="/chat" className="hover:text-action">Chat Online</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-action">Contato</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/90">
            <li className="flex items-center gap-2"><Phone className="size-4" /> (11) 99999-9999</li>
            <li className="flex items-center gap-2"><Mail className="size-4" /> contato@nobrepatinhas.com</li>
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" /> Rua dos Pets, 123 — Centro, São Paulo/SP</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-action">Funcionamento</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/90">
            <li className="flex items-center gap-2"><Clock className="size-4" /> Seg–Sex: 8h às 20h</li>
            <li className="flex items-center gap-2"><Clock className="size-4" /> Sábado: 9h às 18h</li>
            <li className="flex items-center gap-2"><Clock className="size-4" /> Domingo: 10h às 14h</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-primary-foreground/70">
        © {new Date().getFullYear()} Nobre Patinhas — Todos os direitos reservados.
      </div>
    </footer>
  );
}
