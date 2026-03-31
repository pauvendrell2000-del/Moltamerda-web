"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, User, Briefcase, Calendar, Loader2 } from "lucide-react";
import { LABELS_TIPO_SERVICIO, LABELS_FRANJA_HORARIA } from "@/types/reservas";
import { format, addDays, isWeekend } from "date-fns";

// ── Schema de validación ────────────────────────────────────────
const paso1Schema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  tipo_cliente: z.enum(["empresa", "particular"]),
  empresa: z.string().optional(),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(9, "Teléfono inválido").max(15, "Teléfono demasiado largo"),
});

const paso2Schema = z.object({
  tipo_servicio: z.enum([
    "maquinas_agricolas",
    "maquinaria_industrial",
    "naves_piscinas",
    "naves_ganaderas",
    "fumigacion_hipicas",
    "fumigacion_centros_caninos",
  ]),
  superficie_m2: z.coerce.number().min(10, "Mínimo 10 m²").max(10000, "Máximo 10.000 m²"),
  direccion: z.string().min(5, "Dirección requerida"),
  ciudad: z.string().min(2, "Ciudad requerida"),
  codigo_postal: z.string().regex(/^\d{5}$/, "Código postal debe tener 5 dígitos"),
});

const paso3Schema = z.object({
  fecha: z.string().min(1, "Selecciona una fecha"),
  franja_horaria: z.enum(["manana", "tarde"]),
  observaciones: z.string().max(500, "Máximo 500 caracteres").optional(),
});

const formSchema = paso1Schema.merge(paso2Schema).merge(paso3Schema).refine(
  (data) => {
    if (data.tipo_cliente === "empresa") {
      return !!data.empresa && data.empresa.trim().length > 0;
    }
    return true;
  },
  { message: "El nombre de empresa es requerido", path: ["empresa"] }
);

type FormData = z.infer<typeof formSchema>;

// ── Helpers ─────────────────────────────────────────────────────
const today = new Date();
today.setHours(0, 0, 0, 0);
const maxDate = addDays(today, 60);

function getMinDate() {
  // Next working day
  let d = addDays(today, 1);
  while (isWeekend(d)) d = addDays(d, 1);
  return format(d, "yyyy-MM-dd");
}

function getMaxDate() {
  return format(maxDate, "yyyy-MM-dd");
}

// ── Componentes de UI ────────────────────────────────────────────
function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-[#0F1923] mb-1.5">
      {children}
      {required && <span className="text-[#EF4444] ml-1">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[#EF4444] text-xs mt-1">{message}</p>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const { error, className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full px-4 py-3 rounded-xl border ${
        error ? "border-[#EF4444] bg-red-50" : "border-slate-200"
      } bg-white text-[#0F1923] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A878]/30 focus:border-[#00A878] transition-all ${className ?? ""}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  const { error, className, children, ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full px-4 py-3 rounded-xl border ${
        error ? "border-[#EF4444] bg-red-50" : "border-slate-200"
      } bg-white text-[#0F1923] focus:outline-none focus:ring-2 focus:ring-[#00A878]/30 focus:border-[#00A878] transition-all ${className ?? ""}`}
    >
      {children}
    </select>
  );
}

// ── Pasos indicador ──────────────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  const pasos = [
    { num: 1, label: "Tus Datos", icon: User },
    { num: 2, label: "Servicio", icon: Briefcase },
    { num: 3, label: "Fecha", icon: Calendar },
  ];

  return (
    <div className="flex items-center justify-center mb-10">
      {pasos.map((paso, index) => {
        const Icon = paso.icon;
        const isActive = paso.num === currentStep;
        const isDone = paso.num < currentStep;
        return (
          <div key={paso.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? "bg-[#00A878] text-white"
                    : isActive
                    ? "bg-[#1A2332] text-white shadow-lg shadow-[#1A2332]/25"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium ${
                  isActive ? "text-[#1A2332]" : isDone ? "text-[#00A878]" : "text-slate-400"
                }`}
              >
                {paso.label}
              </span>
            </div>
            {index < pasos.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-all duration-300 ${
                  paso.num < currentStep ? "bg-[#00A878]" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Formulario principal ─────────────────────────────────────────
export default function ReservarPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "ca";
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    control,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      tipo_cliente: "particular",
      franja_horaria: "manana",
    },
  });

  const tipoCliente = watch("tipo_cliente");
  const observaciones = watch("observaciones") ?? "";

  // Validar paso actual antes de avanzar
  const handleNextStep = async () => {
    let valid = false;
    if (currentStep === 1) {
      const fields: (keyof FormData)[] = ["nombre", "tipo_cliente", "email", "telefono"];
      if (tipoCliente === "empresa") fields.push("empresa");
      valid = await trigger(fields);
    } else if (currentStep === 2) {
      valid = await trigger(["tipo_servicio", "superficie_m2", "direccion", "ciudad", "codigo_postal"]);
    }
    if (valid) setCurrentStep((s) => s + 1);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Error al crear la reserva");
      }

      toast.success("¡Reserva creada con éxito!");
      router.push(`/${locale}/confirmacion/${json.data.id}?codigo=${json.data.codigo}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al enviar la reserva";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-[#1A2332] text-white py-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <a href={`/${locale}`} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </a>
          <h1 className="font-semibold font-display">Solicitar Servicio</h1>
          <div />
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <StepIndicator currentStep={currentStep} />

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">

            {/* ── PASO 1: DATOS ───────────────────────────────── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#0F1923]">Tus datos de contacto</h2>
                  <p className="text-slate-500 text-sm mt-1">Los usaremos para confirmar tu reserva</p>
                </div>

                {/* Nombre */}
                <div>
                  <Label required>Nombre completo</Label>
                  <Input
                    {...register("nombre")}
                    placeholder="Juan García López"
                    error={errors.nombre?.message}
                  />
                  <FieldError message={errors.nombre?.message} />
                </div>

                {/* Tipo cliente */}
                <div>
                  <Label required>Tipo de cliente</Label>
                  <Controller
                    name="tipo_cliente"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-3">
                        {(["particular", "empresa"] as const).map((tipo) => (
                          <button
                            key={tipo}
                            type="button"
                            onClick={() => field.onChange(tipo)}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium capitalize text-sm ${
                              field.value === tipo
                                ? "border-[#00A878] bg-[#00A878]/5 text-[#00A878]"
                                : "border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            {tipo === "particular" ? "Particular" : "Empresa"}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                {/* Empresa (condicional) */}
                {tipoCliente === "empresa" && (
                  <div>
                    <Label required>Nombre de la empresa</Label>
                    <Input
                      {...register("empresa")}
                      placeholder="Mi Empresa S.L."
                      error={errors.empresa?.message}
                    />
                    <FieldError message={errors.empresa?.message} />
                  </div>
                )}

                {/* Email */}
                <div>
                  <Label required>Email</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="juan@ejemplo.com"
                    error={errors.email?.message}
                  />
                  <FieldError message={errors.email?.message} />
                </div>

                {/* Teléfono */}
                <div>
                  <Label required>Teléfono</Label>
                  <Input
                    {...register("telefono")}
                    type="tel"
                    placeholder="+34 o 6/7/8/9 + 8 dígitos"
                    error={errors.telefono?.message}
                  />
                  <FieldError message={errors.telefono?.message} />
                </div>
              </div>
            )}

            {/* ── PASO 2: SERVICIO ─────────────────────────────── */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#0F1923]">Detalles del servicio</h2>
                  <p className="text-slate-500 text-sm mt-1">Cuéntanos qué necesitas y dónde</p>
                </div>

                {/* Tipo servicio */}
                <div>
                  <Label required>Tipo de servicio</Label>
                  <Select {...register("tipo_servicio")} error={errors.tipo_servicio?.message}>
                    <option value="">Selecciona un servicio...</option>
                    {(Object.entries(LABELS_TIPO_SERVICIO) as [string, string][]).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                  <FieldError message={errors.tipo_servicio?.message} />
                </div>

                {/* Superficie */}
                <div>
                  <Label required>Superficie aproximada (m²)</Label>
                  <Input
                    {...register("superficie_m2")}
                    type="number"
                    min={10}
                    max={10000}
                    placeholder="500"
                    error={errors.superficie_m2?.message}
                  />
                  <FieldError message={errors.superficie_m2?.message} />
                </div>

                {/* Dirección */}
                <div>
                  <Label required>Dirección</Label>
                  <Input
                    {...register("direccion")}
                    placeholder="Calle Mayor, 15"
                    error={errors.direccion?.message}
                  />
                  <FieldError message={errors.direccion?.message} />
                </div>

                {/* Ciudad + CP en fila */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label required>Ciudad</Label>
                    <Input
                      {...register("ciudad")}
                      placeholder="Barcelona"
                      error={errors.ciudad?.message}
                    />
                    <FieldError message={errors.ciudad?.message} />
                  </div>
                  <div>
                    <Label required>Código postal</Label>
                    <Input
                      {...register("codigo_postal")}
                      placeholder="08001"
                      maxLength={5}
                      error={errors.codigo_postal?.message}
                    />
                    <FieldError message={errors.codigo_postal?.message} />
                  </div>
                </div>
              </div>
            )}

            {/* ── PASO 3: FECHA ──────────────────────────────────── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#0F1923]">Fecha y franja horaria</h2>
                  <p className="text-slate-500 text-sm mt-1">Elige cuándo quieres que vayamos</p>
                </div>

                {/* Fecha */}
                <div>
                  <Label required>Fecha del servicio</Label>
                  <Input
                    {...register("fecha")}
                    type="date"
                    min={getMinDate()}
                    max={getMaxDate()}
                    error={errors.fecha?.message}
                  />
                  <p className="text-slate-400 text-xs mt-1">Solo días laborables (lunes a viernes)</p>
                  <FieldError message={errors.fecha?.message} />
                </div>

                {/* Franja horaria */}
                <div>
                  <Label required>Franja horaria</Label>
                  <Controller
                    name="franja_horaria"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(["manana", "tarde"] as const).map((franja) => (
                          <button
                            key={franja}
                            type="button"
                            onClick={() => field.onChange(franja)}
                            className={`py-4 px-5 rounded-xl border-2 transition-all text-left ${
                              field.value === franja
                                ? "border-[#00A878] bg-[#00A878]/5"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className={`font-semibold text-sm ${field.value === franja ? "text-[#00A878]" : "text-[#0F1923]"}`}>
                              {franja === "manana" ? "Mañana" : "Tarde"}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {LABELS_FRANJA_HORARIA[franja].replace(/Mañana|Tarde/, "").trim()}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                  <FieldError message={errors.franja_horaria?.message} />
                </div>

                {/* Observaciones */}
                <div>
                  <Label>Observaciones <span className="text-slate-400 font-normal">(opcional)</span></Label>
                  <textarea
                    {...register("observaciones")}
                    rows={4}
                    placeholder="Indica cualquier detalle relevante: accesos especiales, materiales en el lugar, condiciones específicas..."
                    maxLength={500}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-[#0F1923] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A878]/30 focus:border-[#00A878] transition-all resize-none"
                  />
                  <div className="flex justify-between mt-1">
                    <FieldError message={errors.observaciones?.message} />
                    <span className="text-xs text-slate-400 ml-auto">{observaciones.length}/500</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Botones de navegación ───────────────────────── */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  className="flex items-center gap-2 text-slate-500 hover:text-[#0F1923] transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Atrás
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 bg-[#1A2332] hover:bg-[#243144] text-white font-semibold px-6 py-3 rounded-xl transition-all"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-[#00A878] hover:bg-[#009068] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-[#00A878]/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmar reserva
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Info adicional */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00A878]" />
            Sin compromiso
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00A878]" />
            Confirmación en 24h
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00A878]" />
            Presupuesto gratuito
          </span>
        </div>
      </main>
    </div>
  );
}
