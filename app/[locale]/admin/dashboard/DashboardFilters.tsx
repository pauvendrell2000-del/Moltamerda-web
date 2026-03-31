"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, Filter } from "lucide-react";
import { LABELS_ESTADO } from "@/types/reservas";

interface Props {
  estadoActual: string;
  busquedaActual: string;
}

export default function DashboardFilters({ estadoActual, busquedaActual }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [busqueda, setBusqueda] = useState(busquedaActual);

  const updateFilters = useCallback(
    (nuevoEstado: string, nuevaBusqueda: string) => {
      const params = new URLSearchParams();
      if (nuevoEstado && nuevoEstado !== "todos") params.set("estado", nuevoEstado);
      if (nuevaBusqueda) params.set("busqueda", nuevaBusqueda);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") updateFilters(estadoActual, busqueda);
          }}
          placeholder="Buscar por nombre, email, código..."
          className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-[#0F1923] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00A878]/30 focus:border-[#00A878] transition-all w-full sm:w-64"
        />
      </div>

      {/* Filtro estado */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <select
          value={estadoActual}
          onChange={(e) => updateFilters(e.target.value, busqueda)}
          className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-[#0F1923] focus:outline-none focus:ring-2 focus:ring-[#00A878]/30 focus:border-[#00A878] transition-all appearance-none"
        >
          <option value="todos">Todos los estados</option>
          {(Object.entries(LABELS_ESTADO) as [string, string][]).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Botón buscar */}
      <button
        onClick={() => updateFilters(estadoActual, busqueda)}
        className="px-4 py-2 bg-[#1A2332] hover:bg-[#243144] text-white text-sm font-medium rounded-xl transition-all"
      >
        Buscar
      </button>
    </div>
  );
}
