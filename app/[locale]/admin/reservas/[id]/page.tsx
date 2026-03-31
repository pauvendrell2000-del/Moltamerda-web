import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import {
  LABELS_TIPO_SERVICIO,
  LABELS_TIPO_CLIENTE,
  LABELS_FRANJA_HORARIA,
  LABELS_ESTADO,
  BADGE_COLORS,
  type Reserva,
} from "@/types/reservas";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  MessageSquare,
  Hash,
  Building2,
  Phone,
  Mail,
  Ruler,
} from "lucide-react";
import Link from "next/link";
import EstadoSelector from "./EstadoSelector";

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-[#0F1923]">{value}</p>
      </div>
    </div>
  );
}

export default async function ReservaDetallePage({ params }: Props) {
  const { locale, id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  const { data: reserva, error } = await supabase
    .from("reservas")
    .select("*")
    .eq("id", id)
    .single<Reserva>();

  if (error || !reserva) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-[#1A2332] text-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link
              href={`/${locale}/admin/dashboard`}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <span className="text-slate-600">/</span>
            <span className="font-semibold font-mono text-[#00A878]">{reserva.codigo}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de reserva */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold font-display text-[#0F1923]">
                Reserva {reserva.codigo}
              </h1>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${BADGE_COLORS[reserva.estado]}`}
              >
                {LABELS_ESTADO[reserva.estado]}
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              Creada el {format(new Date(reserva.created_at), "d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
            </p>
          </div>

          {/* Selector de estado */}
          <EstadoSelector reservaId={reserva.id} estadoActual={reserva.estado} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos del cliente */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-5 h-5 text-[#1A2332]" />
                <h2 className="font-semibold font-display text-[#0F1923]">Datos del cliente</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow icon={User} label="Nombre" value={reserva.nombre} />
                <InfoRow icon={Building2} label="Tipo" value={LABELS_TIPO_CLIENTE[reserva.tipo_cliente]} />
                {reserva.empresa && (
                  <InfoRow icon={Building2} label="Empresa" value={reserva.empresa} />
                )}
                <InfoRow icon={Mail} label="Email" value={reserva.email} />
                <InfoRow icon={Phone} label="Teléfono" value={reserva.telefono} />
              </div>
            </div>

            {/* Detalles del servicio */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Building2 className="w-5 h-5 text-[#1A2332]" />
                <h2 className="font-semibold font-display text-[#0F1923]">Detalles del servicio</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow
                  icon={Hash}
                  label="Tipo de servicio"
                  value={LABELS_TIPO_SERVICIO[reserva.tipo_servicio]}
                />
                <InfoRow
                  icon={Ruler}
                  label="Superficie"
                  value={`${reserva.superficie_m2} m²`}
                />
                <InfoRow icon={MapPin} label="Dirección" value={reserva.direccion} />
                <InfoRow icon={MapPin} label="Ciudad" value={`${reserva.ciudad} (${reserva.codigo_postal})`} />
              </div>
            </div>

            {/* Observaciones */}
            {reserva.observaciones && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-[#1A2332]" />
                  <h2 className="font-semibold font-display text-[#0F1923]">Observaciones</h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl p-4">
                  {reserva.observaciones}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Fecha y hora */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#1A2332]" />
                <h2 className="font-semibold font-display text-[#0F1923]">Fecha y hora</h2>
              </div>
              <div className="text-center py-4">
                <div className="text-4xl font-bold font-display text-[#1A2332]">
                  {format(new Date(reserva.fecha), "d", { locale: es })}
                </div>
                <div className="text-lg text-slate-500 font-medium">
                  {format(new Date(reserva.fecha), "MMMM yyyy", { locale: es })}
                </div>
                <div className="mt-3 inline-flex items-center bg-[#00A878]/10 text-[#00A878] text-sm font-medium px-3 py-1 rounded-full">
                  {LABELS_FRANJA_HORARIA[reserva.franja_horaria]}
                </div>
              </div>
            </div>

            {/* Info rápida */}
            <div className="bg-[#1A2332] rounded-2xl p-6 text-white">
              <h3 className="font-semibold text-sm mb-4 text-slate-300">Resumen</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">ID</span>
                  <span className="font-mono text-xs text-slate-300 truncate ml-2 max-w-[120px]">{reserva.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Código</span>
                  <span className="font-mono font-bold text-[#00A878]">{reserva.codigo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Estado</span>
                  <span>{LABELS_ESTADO[reserva.estado]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Superficie</span>
                  <span>{reserva.superficie_m2} m²</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
