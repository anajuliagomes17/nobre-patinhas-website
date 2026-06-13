export type Species = "cachorros" | "gatos" | "passaros" | "peixes" | "outros";
export type Category = "racoes" | "acessorios" | "brinquedos" | "higiene" | "medicamentos" | "roupas";

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: Category;
  species: Species;
  description: string;
  stock: number;
  image?: string;
};

export const SERVICES = [
  { id: "banho", name: "Banho", price: 60, duration: 60 },
  { id: "tosa", name: "Tosa", price: 80, duration: 75 },
  { id: "hidratacao", name: "Hidratação", price: 35, duration: 45 },
  { id: "consulta", name: "Consulta Veterinária", price: 150, duration: 45 },
  { id: "vacinacao", name: "Vacinação", price: 90, duration: 30 },
];

export const TESTIMONIALS = [
  { id: 1, name: "Marina Oliveira", rating: 5, comment: "Atendimento maravilhoso! Meu Thor amou o banho e tosa. Voltarei sempre.", avatar: "M" },
  { id: 2, name: "Carlos Henrique", rating: 5, comment: "Loja com preços ótimos e entrega super rápida. Recomendo!", avatar: "C" },
  { id: 3, name: "Patrícia Souza", rating: 4, comment: "Profissionais super carinhosos com a minha gata. Ambiente limpo e organizado.", avatar: "P" },
  { id: 4, name: "Rafael Mendes", rating: 5, comment: "Agendei pelo site em 30 segundos. Prático e moderno!", avatar: "R" },
];
