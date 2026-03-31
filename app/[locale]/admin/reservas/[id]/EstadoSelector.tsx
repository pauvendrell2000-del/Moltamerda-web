"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { LABELS_ESTADO, BADGE_COLORS, type EstadoReserva } from "@/types/reservas";

interface Props {
  reservaId: string;
  estadoActual: EstadoReserva;
}

const ESTADOS_TRANSICION: Record<EstadoReserva, EstadoReserva[]> = {
  pendiente: ["confirmada", "cancelada"],
  confirmada: ["completada", "cancelada"],
  cancelada: [],
  completada: [],
};

export default function EstadoSelector({ reservaId, estadoActual }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const transiciones = ESTADOS_TRANSICION[estadoActual];

  if (transiciones.length === 0) return null;

  const cambiarEstado = async (nuevoEstado: EstadoReserva) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reservas/${reservaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Error al actualizar");

      toast.success(`Estado cambiado a ${LABELS_ESTADO[nuevoEstado]}`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al actualizar estado";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {isLoading && (
        <div className="flex items-center gap-1 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Actualizando...
        </div>
      )}
      {!isLoading && transiciones.map((estado) => (
        <button
          key={estado}
          onClick={() => cambiarEstado(estado)}
          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border transition-all hover:opacity-80 ${BADGE_COLORS[estado]}`}
        >
          Marcar como {LABELS_ESTADO[estado].toLowerCase()}
        </button>
      ))}
    </div>
  );
}
