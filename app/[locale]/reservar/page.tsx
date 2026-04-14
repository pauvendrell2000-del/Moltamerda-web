"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, User, Briefcase, Calendar, Loader2 } from "lucide-react";
import { format, addDays, isWeekend } from "date-fns";
import { getT } from "@/lib/i18n";

// ── Helpers ─────────────────────────────────────────────────────
const today = new Date();
today.setHours(0, 0, 0, 0);
const maxDate = addDays(today, 60);

function getMinDate() {
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

// ── Formulario principal ─────────────────────────────────────────
export default function ReservarPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? "ca";
  const t = getT(locale);
  const tr = t.reserva;

  // ── Schema de validación (con mensajes localizados) ──────────
  const paso1Schema = z.object({
    nombre: z.string().min(2, tr.validacio.nomCurt),
    tipo_cliente: z.enum(["empresa", "particular"]),
    empresa: z.string().optional(),
    email: z.string().email(tr.validacio.emailInvalid),
    telefono: z.string().min(9, tr.validacio.telefonInvalid).max(15, tr.validacio.telefonLlarg),
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
    superficie_m2: z.coerce.number().min(10, tr.validacio.superficieMin).max(10000, tr.validacio.superficieMax),
    direccion: z.string().min(5, tr.validacio.adrecaRequerida),
    ciudad: z.string().min(2, tr.validacio.ciutatRequerida),
    codigo_postal: z.string().regex(/^\d{5}$/, tr.validacio.codiPostalInvalid),
  });

  const paso3Schema = z.object({
    fecha: z.string().min(1, tr.validacio.dataRequerida),
    franja_horaria: z.enum(["manana", "tarde"]),
    observaciones: z.string().max(500, tr.validacio.observacionsMax).optional(),
  });

  const formSchema = paso1Schema.merge(paso2Schema).merge(paso3Schema).refine(
    (data) => {
      if (data.tipo_cliente === "empresa") {
        return !!data.empresa && data.empresa.trim().length > 0;
      }
      return true;
    },
    { message: tr.validacio.empresaRequerida, path: ["empresa"] }
  );

  type FormData = z.infer<typeof formSchema>;

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
        throw new Error(json.error ?? tr.toast.error);
      }

      toast.success(tr.toast.exit);
      router.push(`/${locale}/confirmacion/${json.data.id}?codigo=${json.data.codigo}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : tr.toast.error;
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step indicator ───────────────────────────────────────────
  const pasos = [
    { num: 1, label: tr.passos[0], icon: User },
    { num: 2, label: tr.passos[1], icon: Briefcase },
    { num: 3, label: tr.passos[2], icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-[#1A2332] text-white py-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <a href={`/${locale}`} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            {tr.tornar}
          </a>
          <h1 className="font-semibold font-display">{tr.titolPagina}</h1>
          <div />
        </div>
      </header>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Step indicator */}
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

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">

            {/* ── PASO 1: DATOS ───────────────────────────────── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold font-display text-[#0F1923]">{tr.pas1.titol}</h2>
                  <p className="text-slate-500 text-sm mt-1">{tr.pas1.subtitol}</p>
                </div>

                {/* Nombre */}
                <div>
                  <Label required>{tr.pas1.nom}</Label>
                  <Input
                    {...register("nombre")}
                    placeholder={tr.pas1.nomPlaceholder}
                    error={errors.nombre?.message}
                  />
                  <FieldError message={errors.nombre?.message} />
                </div>

                {/* Tipo cliente */}
                <div>
                  <Label required>{tr.pas1.tipusClient}</Label>
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
                            {tipo === "particular" ? tr.pas1.particular : tr.pas1.empresa}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>

                {/* Empresa (condicional) */}
                {tipoCliente === "empresa" && (
                  <div>
                    <Label required>{tr.pas1.nomEmpresa}</Label>
                    <Input
                      {...register("empresa")}
                      placeholder={tr.pas1.nomEmpresaPlaceholder}
                      error={errors.empresa?.message}
                    />
                    <FieldError message={errors.empresa?.message} />
                  </div>
                )}

                {/* Email */}
                <div>
                  <Label required>{tr.pas1.email}</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder={tr.pas1.emailPlaceholder}
                    error={errors.email?.message}
                  />
                  <FieldError message={errors.email?.message} />
                </div>

                {/* Teléfono */}
                <div>
                  <Label required>{tr.pas1.telefon}</Label>
                  <Input
                    {...register("telefono")}
                    type="tel"
                    placeholder={tr.pas1.telefonPlaceholder}
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
                  <h2 className="text-xl font-bold font-display text-[#0F1923]">{tr.pas2.titol}</h2>
                  <p className="text-slate-500 text-sm mt-1">{tr.pas2.subtitol}</p>
                </div>

                {/* Tipo servicio */}
                <div>
                  <Label required>{tr.pas2.tipusServei}</Label>
                  <Select {...register("tipo_servicio")} error={errors.tipo_servicio?.message}>
                    <option value="">{tr.pas2.tipusServeiPlaceholder}</option>
                    {(Object.entries(tr.pas2.serveis) as [string, string][]).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </Select>
                  <FieldError message={errors.tipo_servicio?.message} />
                </div>

                {/* Superficie */}
                <div>
                  <Label required>{tr.pas2.superficie}</Label>
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
                  <Label required>{tr.pas2.adreca}</Label>
                  <Input
                    {...register("direccion")}
                    placeholder={tr.pas2.adrecaPlaceholder}
                    error={errors.direccion?.message}
                  />
                  <FieldError message={errors.direccion?.message} />
                </div>

                {/* Ciudad + CP en fila */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label required>{tr.pas2.ciutat}</Label>
                    <Input
                      {...register("ciudad")}
                      placeholder={tr.pas2.ciutatPlaceholder}
                      error={errors.ciudad?.message}
                    />
                    <FieldError message={errors.ciudad?.message} />
                  </div>
                  <div>
                    <Label required>{tr.pas2.codiPostal}</Label>
                    <Input
                      {...register("codigo_postal")}
                      placeholder={tr.pas2.codiPostalPlaceholder}
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
                  <h2 className="text-xl font-bold font-display text-[#0F1923]">{tr.pas3.titol}</h2>
                  <p className="text-slate-500 text-sm mt-1">{tr.pas3.subtitol}</p>
                </div>

                {/* Fecha */}
                <div>
                  <Label required>{tr.pas3.dataServei}</Label>
                  <Input
                    {...register("fecha")}
                    type="date"
                    min={getMinDate()}
                    max={getMaxDate()}
                    error={errors.fecha?.message}
                  />
                  <p className="text-slate-400 text-xs mt-1">{tr.pas3.diesLaborables}</p>
                  <FieldError message={errors.fecha?.message} />
                </div>

                {/* Franja horaria */}
                <div>
                  <Label required>{tr.pas3.franjaHoraria}</Label>
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
                              {franja === "manana" ? tr.pas3.franja.manana : tr.pas3.franja.tarde}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {franja === "manana" ? tr.pas3.franja.mananaHores : tr.pas3.franja.tardeHores}
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
                  <Label>
                    {tr.pas3.observacions}{" "}
                    <span className="text-slate-400 font-normal">{tr.pas3.opcional}</span>
                  </Label>
                  <textarea
                    {...register("observaciones")}
                    rows={4}
                    placeholder={tr.pas3.observacionsPlaceholder}
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
                  {tr.nav.enrere}
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
                  {tr.nav.continuar}
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
                      {tr.nav.enviant}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {tr.nav.confirmar}
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
            {tr.peu.senseCompromis}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00A878]" />
            {tr.peu.confirmacio24h}
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00A878]" />
            {tr.peu.pressupostGratuit}
          </span>
        </div>
      </main>
    </div>
  );
}
