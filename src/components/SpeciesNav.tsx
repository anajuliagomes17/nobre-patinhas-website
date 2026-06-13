import { Dog, Cat, Bird, Fish, Rabbit, PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { id: "todos", label: "Todos", Icon: PawPrint },
  { id: "cachorros", label: "Cachorros", Icon: Dog },
  { id: "gatos", label: "Gatos", Icon: Cat },
  { id: "passaros", label: "Pássaros", Icon: Bird },
  { id: "peixes", label: "Peixes", Icon: Fish },
  { id: "outros", label: "Outros", Icon: Rabbit },
] as const;

export function SpeciesNav({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <h2 className="mb-4 text-lg font-bold text-foreground">Navegue por Espécie</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 md:gap-6">
        {items.map(({ id, label, Icon }) => {
          const active = value === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="group flex shrink-0 flex-col items-center gap-2"
            >
              <span
                className={cn(
                  "grid h-20 w-20 place-items-center rounded-full border-2 transition-all",
                  active
                    ? "border-action bg-action/15 text-primary shadow-md"
                    : "border-border bg-card text-primary group-hover:border-primary/40 group-hover:bg-accent/40",
                )}
              >
                <Icon className="size-8" strokeWidth={2.2} />
              </span>
              <span className={cn("text-xs font-semibold", active ? "text-primary" : "text-muted-foreground")}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
