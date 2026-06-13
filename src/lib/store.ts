import { useEffect, useState, useSyncExternalStore } from "react";
import { type Product } from "./seed";

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  emit();
}

export function useStore<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const subscribe = (l: Listener) => {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => { if (e.key === key) l(); };
    window.addEventListener("storage", onStorage);
    return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
  };
  const getSnap = () => {
    if (typeof window === "undefined") return JSON.stringify(fallback);
    return window.localStorage.getItem(key) ?? JSON.stringify(fallback);
  };
  const getServerSnap = () => JSON.stringify(fallback);
  const raw = useSyncExternalStore(subscribe, getSnap, getServerSnap);
  let value: T;
  try { value = raw ? (JSON.parse(raw) as T) : fallback; } catch { value = fallback; }
  const set = (v: T | ((prev: T) => T)) => {
    const next = typeof v === "function" ? (v as (p: T) => T)(value) : v;
    write(key, next);
  };
  return [value, set];
}

// Domain types
export type Role = "cliente" | "admin" | "repositor" | "funcionario";
export type User = { id: string; name: string; email: string; password: string; role: Role; photo?: string };
export type Pet = { id: string; ownerId: string; name: string; species: string; breed: string; age: number; weight: number; history: string; photo?: string };
export type CartItem = { productId: string; qty: number };
export type Order = { id: string; userId: string; items: CartItem[]; total: number; status: "pendente" | "pago" | "enviado" | "entregue"; createdAt: string };
export type Appointment = { id: string; userId: string; petId: string; serviceId: string; date: string; time: string; notes: string; status: "agendado" | "concluido" | "cancelado" };
export type ChatMsg = { from: "user" | "bot" | "staff"; text: string; at: string };
export type ChatThread = { id: string; userName: string; userId?: string; messages: ChatMsg[]; handover: boolean; closed?: boolean };

// Hooks
export const useAuth = () => useStore<User | null>("np_auth", null);
export const useUsers = () => useStore<User[]>("np_users", []);
export const usePets = () => useStore<Pet[]>("np_pets", []);
export const useCart = () => useStore<CartItem[]>("np_cart", []);
export const useOrders = () => useStore<Order[]>("np_orders", []);
export const useAppointments = () => useStore<Appointment[]>("np_appointments", []);
export const useStockOverrides = () => useStore<Record<string, number>>("np_stock", {});
export const useProductEdits = () => useStore<Record<string, Partial<Product>>>("np_prod_edits", {});
export const useCustomProducts = () => useStore<Product[]>("np_prod_custom", []);
export const useDeletedProducts = () => useStore<string[]>("np_prod_deleted", []);
export const useChatThreads = () => useStore<ChatThread[]>("np_chat_threads", []);

export function useProducts() {

  const [products, setProducts] = useState<Product[]>([]);

  const reloadProducts = async () => {

    try {

      const res = await fetch(
        "http://localhost/nobre-patinhas-api/produtos.php"
      );

      const data = await res.json();

      const formatted: Product[] = data.map((p: any) => ({
        id: String(p.id),
        name: p.name,
        brand: p.brand,
        price: Number(p.price),
        category: p.category,
        species: p.species,
        description: p.description ?? "",
        stock: Number(p.stock ?? 0),
        image: p.image ?? undefined,
      }));

      setProducts(formatted);

    } catch (err) {

      console.error("Erro ao carregar produtos:", err);

    }

  };

  useEffect(() => {
    reloadProducts();
  }, []);

  return {
    products,
    reloadProducts
  };
}

export const uid = () => Math.random().toString(36).slice(2, 10);

// Cross-platform notification (desktop + mobile via Notification API)
export async function notify(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  try {
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico", badge: "/favicon.ico" });
    }
  } catch {
    /* ignore */
  }
}

// Convert File to base64 data URL (for photo uploads)
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
