import Link from "next/link";
import { CheckCircle2, ArrowLeft, Calendar, Mail } from "lucide-react";

interface Props {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ codigo?: string }>;
}

export default async function ConfirmacionPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  const { codigo } = await searchParams;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="bg-[#1A2332] text-white py-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <Link
            href={`/${locale}`}
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <h1 className="font-semibold font-display">Confirmación</h1>
          <div />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          {/* Card principal */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 text-center">
            {/* Icono check */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-[#00A878]/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-[#00A878]" />
                </div>
                <div className="absolute inset-0 rounded-full bg-[#00A878]/5 animate-ping" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#0F1923] mb-2">
              ¡Reserva Confirmada!
            </h1>
            <p className="text-slate-500 mb-8">
              Hemos recibido tu solicitud correctamente.
            </p>

            {/* Código de reserva */}
            {codigo && (
              <div className="bg-[#F8FAFC] border-2 border-dashed border-slate-200 rounded-xl p-6 mb-8">
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Código de reserva</p>
                <p className="text-4xl font-bold font-mono text-[#1A2332] tracking-wider">
                  {codigo}
                </p>
                <p className="text-xs text-slate-400 mt-2">Guarda este código para hacer seguimiento</p>
              </div>
            )}

            {/* Información adicional */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4 text-left">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F1923]">Email de confirmación</p>
                  <p className="text-xs text-slate-500">Recibirás un email de confirmación en breve con todos los detalles.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-4 text-left">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F1923]">Confirmación en 24h</p>
                  <p className="text-xs text-slate-500">Nuestro equipo revisará tu solicitud y te contactará para confirmar el servicio.</p>
                </div>
              </div>
            </div>

            {/* Botón volver */}
            <Link
              href={`/${locale}`}
              className="inline-flex items-center justify-center gap-2 w-full bg-[#1A2332] hover:bg-[#243144] text-white font-semibold px-6 py-4 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>

            <p className="text-xs text-slate-400 mt-4">
              ¿Tienes alguna pregunta?{" "}
              <a href="mailto:info@limpiezaindustrial.es" className="text-[#00A878] hover:underline">
                Contáctanos
              </a>
            </p>
          </div>

          {/* ID de reserva */}
          {id && (
            <p className="text-center text-xs text-slate-400 mt-4">
              ID de reserva: <span className="font-mono">{id}</span>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
