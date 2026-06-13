import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { useAuth, useStockOverrides, useProducts } from "@/lib/store";
import { formatBRL } from "@/components/ProductCard";
import { useEffect, useMemo, useState } from "react";
import { Package, ShoppingCart, Calendar, Users, AlertTriangle, TrendingUp, FileText } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Painel Administrativo — Nobre Patinhas" }] }),
  component: Admin,
});

function Admin() {
  const [loaded, setLoaded] = useState(false);
  const [auth] = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setLoaded(true); }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!auth) { navigate({ to: "/login" }); return; }
    if (auth.role === "cliente") navigate({ to: "/conta" });
  }, [auth, loaded, navigate]);

  if (!loaded || !auth || auth.role === "cliente") return null;

  const isRepositor = auth.role === "repositor";

  return (
    <Layout>
      <PageHeader
        title={isRepositor ? "Área do Repositor" : "Painel Administrativo"}
        subtitle={isRepositor ? "Gerencie o estoque." : "Visão geral da operação."}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {isRepositor ? <RepositorView /> : <AdminView />}
      </div>
    </Layout>
  );
}

function AdminView() {
  const [orders, setOrders] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const { products } = useProducts();

  useEffect(() => {
    loadOrders();
    loadUsers();
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await fetch("http://localhost/nobre-patinhas-api/listar_agendamentos_admin.php");
      const data = await res.json();
      setAppts(data);
    } catch (err) { console.error(err); }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch("http://localhost/nobre-patinhas-api/listar_pedidos_admin.php");
      const data = await response.json();
      const formatted = data.map((p: any) => ({
        id: String(p.id),
        userId: String(p.usuario_id),
        total: Number(p.total),
        status: p.status,
        createdAt: String(p.data_pedido).slice(0, 10), // garante só a data
        nome: p.nome,
      }));
      setOrders(formatted);
    } catch (error) { console.error(error); }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch("http://localhost/nobre-patinhas-api/listar_usuarios.php");
      const data = await response.json();
      setUsers(data);
    } catch (error) { console.error(error); }
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = appts.filter((a) => String(a.data_agendamento) === today);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const lowStock = products.filter((p) => p.stock < 10);

  // Gera os últimos 7 dias com valor 0 como base, depois preenche com os pedidos
  const salesByDay = useMemo(() => {
    const map = new Map<string, number>();

    // Pré-popula os últimos 7 dias com 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      map.set(d.toISOString().slice(0, 10), 0);
    }

    // Preenche com os pedidos que caem nesses dias
    orders.forEach((o) => {
      if (map.has(o.createdAt)) {
        map.set(o.createdAt, (map.get(o.createdAt) ?? 0) + o.total);
      }
    });

    return Array.from(map.entries());
  }, [orders]);

  const max = Math.max(1, ...salesByDay.map(([, v]) => v));

  const gerarPDF = () => {
    const linhasPedidos = orders
      .slice(-10)
      .reverse()
      .map(
        (o) =>
          `<tr>
            <td style="padding:6px 12px;border-bottom:1px solid #eee">#${o.id}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #eee">${o.nome}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #eee">${o.createdAt}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">${formatBRL(o.total)}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #eee">${o.status}</td>
          </tr>`
      )
      .join("");

    const linhasEstoque = lowStock
      .map(
        (p) =>
          `<tr>
            <td style="padding:6px 12px;border-bottom:1px solid #eee">${p.name}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #eee;color:#dc2626;font-weight:bold">${p.stock} un.</td>
          </tr>`
      )
      .join("");

    const barras = salesByDay
      .map(([d, v]) => {
        const pct = Math.round((v / max) * 100);
        return `<div style="display:flex;flex-direction:column;align-items:center;flex:1;gap:4px">
          <span style="font-size:10px;color:#666">${formatBRL(v)}</span>
          <div style="width:100%;background:#f3f4f6;border-radius:4px;height:80px;display:flex;align-items:flex-end">
            <div style="width:100%;background:#7c3aed;border-radius:4px 4px 0 0;height:${pct}%"></div>
          </div>
          <span style="font-size:10px;color:#666">${d.slice(5)}</span>
        </div>`;
      })
      .join("");

    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Vendas — Nobre Patinhas</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
          h1 { color: #7c3aed; margin-bottom: 4px; }
          h2 { color: #7c3aed; margin-top: 32px; margin-bottom: 12px; font-size: 16px; }
          .subtitle { color: #666; margin-bottom: 32px; font-size: 13px; }
          .stats { display: flex; gap: 16px; margin-bottom: 8px; }
          .stat { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
          .stat-label { font-size: 11px; color: #666; }
          .stat-value { font-size: 22px; font-weight: bold; color: #111; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th { background: #f3f4f6; padding: 8px 12px; text-align: left; font-size: 12px; color: #666; }
          .grafico { display: flex; align-items: flex-end; gap: 8px; height: 120px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <h1>🐾 Nobre Patinhas</h1>
        <p class="subtitle">Relatório de Vendas — gerado em ${new Date().toLocaleString("pt-BR")}</p>

        <div class="stats">
          <div class="stat">
            <div class="stat-label">Receita Total</div>
            <div class="stat-value">${formatBRL(totalRevenue)}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Total de Pedidos</div>
            <div class="stat-value">${orders.length}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Clientes Cadastrados</div>
            <div class="stat-value">${users.length}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Agendamentos Hoje</div>
            <div class="stat-value">${todayAppts.length}</div>
          </div>
        </div>

        <h2>Vendas — Últimos 7 dias</h2>
        <div class="grafico">${barras}</div>

        <h2>Últimos Pedidos</h2>
        <table>
          <thead><tr>
            <th>#</th><th>Cliente</th><th>Data</th><th>Total</th><th>Status</th>
          </tr></thead>
          <tbody>${linhasPedidos || '<tr><td colspan="5" style="padding:12px;color:#999">Sem pedidos.</td></tr>'}</tbody>
        </table>

        ${lowStock.length > 0 ? `
        <h2>⚠️ Produtos com Estoque Baixo</h2>
        <table>
          <thead><tr><th>Produto</th><th>Estoque</th></tr></thead>
          <tbody>${linhasEstoque}</tbody>
        </table>` : ""}
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Stat Icon={TrendingUp} label="Receita Total" value={formatBRL(totalRevenue)} />
        <Stat Icon={ShoppingCart} label="Pedidos" value={String(orders.length)} />
        <Stat Icon={Calendar} label="Agendamentos hoje" value={String(todayAppts.length)} />
        <Stat Icon={Users} label="Clientes" value={String(users.length)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-primary">Vendas (últimos 7 dias)</h3>
          <div className="relative h-48">
            <div className="absolute inset-0 flex items-end gap-2">
              {salesByDay.map(([d, v]) => (
                <div key={d} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-primary transition-all"
                    style={{ height: `${Math.max(4, (v / max) * 180)}px` }}
                    title={formatBRL(v)}
                  />
                  <span className="text-[10px] text-muted-foreground">{d.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-destructive">
            <AlertTriangle className="size-4" /> Alertas de estoque baixo
          </h3>
          {lowStock.length === 0
            ? <p className="py-8 text-center text-sm text-muted-foreground">Tudo certo!</p>
            : (
              <ul className="space-y-2 text-sm">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between rounded border p-2">
                    <span className="line-clamp-1">{p.name}</span>
                    <span className="font-bold text-destructive">{p.stock} un.</span>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-primary">Agendamentos de hoje</h3>
          {todayAppts.length === 0
            ? <p className="py-6 text-center text-sm text-muted-foreground">Sem agendamentos.</p>
            : (
              <ul className="space-y-2 text-sm">
                {todayAppts.map((a) => (
                  <li key={a.id} className="flex justify-between rounded border p-2">
                    <div>
                      <span className="font-semibold">{a.pet_nome}</span>
                      <p className="text-xs text-muted-foreground">{a.servico_id}</p>
                    </div>
                    <span className="font-bold">{a.horario}</span>
                  </li>
                ))}
              </ul>
            )}
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-primary">Últimos pedidos</h3>
          {orders.length === 0
            ? <p className="py-6 text-center text-sm text-muted-foreground">Sem pedidos.</p>
            : (
              <ul className="space-y-2 text-sm">
                {orders.slice(-5).reverse().map((o) => (
                  <li key={o.id} className="flex justify-between rounded border p-2">
                    <div>
                      <p className="font-semibold">Pedido #{o.id}</p>
                      <p className="text-xs text-muted-foreground">{o.nome}</p>
                    </div>
                    <span className="font-bold text-primary">{formatBRL(o.total)}</span>
                  </li>
                ))}
              </ul>
            )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-primary">Gestão de Estoque</h3>
          <Link to="/admin/estoque" className="text-sm font-bold text-primary hover:underline">
            Abrir gestão completa →
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Acesse a área do repositor para cadastrar, editar ou excluir produtos.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-primary">Relatório de Vendas</h3>
            <p className="text-sm text-muted-foreground">Gere um PDF com o resumo completo da operação.</p>
          </div>
          <button
            onClick={gerarPDF}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            <FileText className="size-4" /> Gerar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function RepositorView() {
  const { products } = useProducts();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat Icon={Package} label="Total de produtos" value={String(products.length)} />
        <Stat Icon={AlertTriangle} label="Estoque baixo (<10)" value={String(products.filter((p) => p.stock < 10).length)} />
        <Stat Icon={TrendingUp} label="Estoque total" value={String(products.reduce((s, p) => s + p.stock, 0))} />
      </div>
      <Link to="/admin/estoque" className="block">
        <div className="rounded-xl border bg-primary p-6 text-center text-primary-foreground shadow-md hover:brightness-110">
          Abrir Gestão de Estoque →
        </div>
      </Link>
    </div>
  );
}

function Stat({ Icon, label, value }: { Icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-5 shadow-sm">
      <div className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-extrabold text-foreground">{value}</p>
      </div>
    </div>
  );
}