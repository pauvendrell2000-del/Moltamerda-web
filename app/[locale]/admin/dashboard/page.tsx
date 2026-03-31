import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import {
  LABELS_TIPO_SERVICIO,
  LABELS_ESTADO,
  BADGE_COLORS,
  type Reserva,
  type EstadoReserva,
} from "@/types/reservas";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  LogOut,
  Eye,
  CheckCircle2,
  XCircle,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import DashboardFilters from "./DashboardFilters";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ estado?: string; busqueda?: string }>;
}

export default async function DashboardPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { estado: estadoFiltro, busqueda } = await searchParams;

  const supabase = await createClient();

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  // Obtener reservas con filtros
  let query = supabase
    .from("reservas")
    .select("*")
    .order("created_at", { ascending: false });

  if (estadoFiltro && estadoFiltro !== "todos") {
    query = query.eq("estado", estadoFiltro);
  }

  if (busqueda) {
    query = query.or(`nombre.ilike.%${busqueda}%,email.ilike.%${busqueda}%,codigo.ilike.%${busqueda}%`);
  }

  const { data: reservasData, error } = await query.returns<Reserva[]>();
  const reservas = reservasData ?? [];

  if (error) {
    console.error("Error cargando reservas:", error);
  }

  // Calcular KPIs
  const ahora = new Date();
  const inicioSemana = startOfWeek(ahora, { weekStartsOn: 1 });
  const finSemana = endOfWeek(ahora, { weekStartsOn: 1 });

  const { data: todasReservasData } = await supabase
    .from("reservas")
    .select("*")
    .returns<Reserva[]>();
  const todasReservas = todasReservasData ?? [];

  const reservasSemana = todasReservas.filter((r) => {
    const fecha = new Date(r.created_at);
    return fecha >= inicioSemana && fecha <= finSemana;
  });

  const pendientes = todasReservas.filter((r) => r.estado === "pendiente");

  const proximaReserva = todasReservas
    .filter((r) => {
      const fecha = new Date(r.fecha);
      return fecha >= ahora && r.estado !== "cancelada";
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-[#1A2332] text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-[#00A878]" />
              <span className="font-semibold font-display">Panel de Administración</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm hidden sm:block">{user.email}</span>
              <form action={`/${locale}/admin/logout`} method="POST">
                <Link
                  href={`/${locale}/admin/login`}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </Link>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-display text-[#0F1923]">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            {format(ahora, "EEEE, d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {/* Reservas esta semana */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Esta semana</span>
            </div>
            <div className="text-3xl font-bold font-display text-[#0F1923]">
              {reservasSemana.length}
            </div>
            <div className="text-sm text-slate-500 mt-1">Nuevas reservas</div>
          </div>

          {/* Pendientes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Requieren acción</span>
            </div>
            <div className="text-3xl font-bold font-display text-[#0F1923]">
              {pendientes.length}
            </div>
            <div className="text-sm text-slate-500 mt-1">Reservas pendientes</div>
          </div>

          {/* Próxima reserva */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Próxima</span>
            </div>
            {proximaReserva ? (
              <>
                <div className="text-xl font-bold font-display text-[#0F1923]">
                  {format(new Date(proximaReserva.fecha), "d MMM", { locale: es })}
                </div>
                <div className="text-sm text-slate-500 mt-1 truncate">
                  {proximaReserva.codigo} · {LABELS_TIPO_SERVICIO[proximaReserva.tipo_servicio].split(" ").slice(0, 2).join(" ")}
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-bold font-display text-slate-300">—</div>
                <div className="text-sm text-slate-400 mt-1">Sin reservas futuras</div>
              </>
            )}
          </div>
        </div>

        {/* Filtros + tabla */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1A2332]" />
                <h2 className="font-semibold font-display text-[#0F1923]">Reservas</h2>
                <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
                  {reservas.length}
                </span>
              </div>
              <DashboardFilters
                estadoActual={estadoFiltro ?? "todos"}
                busquedaActual={busqueda ?? ""}
              />
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            {reservas.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No hay reservas que mostrar</p>
                <p className="text-sm mt-1">
                  {estadoFiltro || busqueda ? "Prueba a cambiar los filtros" : "Aún no hay reservas registradas"}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Código</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Cliente</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 hidden lg:table-cell">Servicio</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Fecha</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Estado</th>
                    <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservas.map((reserva) => (
                    <tr key={reserva.id} className="hover:bg-slate-50 transition-colors group">
                      {/* Código */}
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-[#1A2332]">
                          {reserva.codigo}
                        </span>
                      </td>

                      {/* Cliente */}
                      <td className="px-4 py-4">
                        <div className="font-medium text-[#0F1923] text-sm">{reserva.nombre}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[160px]">{reserva.email}</div>
                      </td>

                      {/* Servicio */}
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-sm text-slate-600">
                          {LABELS_TIPO_SERVICIO[reserva.tipo_servicio]}
                        </span>
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-4">
                        <div className="text-sm text-[#0F1923]">
                          {format(new Date(reserva.fecha), "d MMM yyyy", { locale: es })}
                        </div>
                        <div className="text-xs text-slate-400">
                          {reserva.franja_horaria === "manana" ? "Mañana" : "Tarde"}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            BADGE_COLORS[reserva.estado]
                          }`}
                        >
                          {LABELS_ESTADO[reserva.estado]}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/${locale}/admin/reservas/${reserva.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#1A2332] hover:bg-slate-100 transition-all"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {reserva.estado === "pendiente" && (
                            <>
                              <ConfirmarBtn reservaId={reserva.id} />
                              <CancelarBtn reservaId={reserva.id} />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Componentes de acción (client components inline no es ideal pero sirve)
function ConfirmarBtn({ reservaId }: { reservaId: string }) {
  return (
    <a
      href={`/api/reservas/${reservaId}?estado=confirmada`}
      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
      title="Confirmar reserva"
    >
      <CheckCircle2 className="w-4 h-4" />
    </a>
  );
}

function CancelarBtn({ reservaId }: { reservaId: string }) {
  return (
    <a
      href={`/api/reservas/${reservaId}?estado=cancelada`}
      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
      title="Cancelar reserva"
    >
      <XCircle className="w-4 h-4" />
    </a>
  );
}
