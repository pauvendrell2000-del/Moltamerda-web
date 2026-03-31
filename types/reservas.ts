// ============================================================
// TIPOS TYPESCRIPT PARA EL SISTEMA DE RESERVAS
// ============================================================

export type TipoCliente = 'empresa' | 'particular'

export type TipoServicio =
  | 'maquinas_agricolas'
  | 'maquinaria_industrial'
  | 'naves_piscinas'
  | 'naves_ganaderas'
  | 'fumigacion_hipicas'
  | 'fumigacion_centros_caninos'

export type FranjaHoraria = 'manana' | 'tarde'

export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada'

// Tipo para el formulario de reserva (input del usuario)
export type FormularioReserva = {
  // Datos del cliente
  nombre: string
  empresa?: string
  email: string
  telefono: string
  tipo_cliente: TipoCliente

  // Detalles del servicio
  tipo_servicio: TipoServicio
  superficie_m2: number
  direccion: string
  ciudad: string
  codigo_postal: string

  // Fecha y hora
  fecha: Date
  franja_horaria: FranjaHoraria

  // Extra
  observaciones?: string
}

// Tipo para la reserva completa en la base de datos
export type Reserva = {
  id: string
  codigo: string

  // Datos del cliente
  nombre: string
  empresa: string | null
  email: string
  telefono: string
  tipo_cliente: TipoCliente

  // Detalles del servicio
  tipo_servicio: TipoServicio
  superficie_m2: number
  direccion: string
  ciudad: string
  codigo_postal: string

  // Fecha y hora
  fecha: string // ISO date string
  franja_horaria: FranjaHoraria

  // Extra
  observaciones: string | null

  // Control
  estado: EstadoReserva
  created_at: string
  updated_at: string
}

// Tipo para crear una nueva reserva (sin campos autogenerados)
export type NuevaReserva = Omit<
  Reserva,
  'id' | 'codigo' | 'created_at' | 'updated_at' | 'estado'
> & {
  estado?: EstadoReserva
}

// Tipo para la respuesta de creación de reserva
export type RespuestaCrearReserva = {
  success: boolean
  data?: {
    id: string
    codigo: string
  }
  error?: string
}

// Tipo para filtros en el dashboard
export type FiltrosReservas = {
  estado?: EstadoReserva
  fecha_desde?: string
  fecha_hasta?: string
  busqueda?: string // nombre, email o código
}

// Tipo para estadísticas del dashboard
export type EstadisticasReservas = {
  total_semana: number
  pendientes: number
  proxima_reserva: {
    fecha: string
    servicio: TipoServicio
    codigo: string
  } | null
}

// Tipo para estadísticas extendidas del dashboard
export type EstadisticasExtendidas = EstadisticasReservas & {
  total_semana_anterior: number
  confirmadas: number
  completadas_mes: number
  canceladas_mes: number
  reservas_hoy: number
  tasa_confirmacion: number // porcentaje
}

// Tipos para paginación
export type PaginacionParams = {
  pagina: number
  porPagina: number
  ordenarPor?: string
  ordenDireccion?: 'asc' | 'desc'
}

export type ResultadoPaginado<T> = {
  datos: T[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}

// Labels en español para los tipos
export const LABELS_TIPO_SERVICIO: Record<TipoServicio, string> = {
  maquinas_agricolas: 'Limpieza Máquinas Agrícolas',
  maquinaria_industrial: 'Limpieza Maquinaria Industrial',
  naves_piscinas: 'Limpieza Naves y Piscinas',
  naves_ganaderas: 'Limpieza Naves Ganaderas',
  fumigacion_hipicas: 'Fumigación Hípicas',
  fumigacion_centros_caninos: 'Fumigación Centros Caninos'
}

export const LABELS_TIPO_CLIENTE: Record<TipoCliente, string> = {
  empresa: 'Empresa',
  particular: 'Particular'
}

export const LABELS_FRANJA_HORARIA: Record<FranjaHoraria, string> = {
  manana: 'Mañana (8:00 - 14:00)',
  tarde: 'Tarde (14:00 - 20:00)'
}

export const LABELS_ESTADO: Record<EstadoReserva, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  completada: 'Completada'
}

export const BADGE_COLORS: Record<EstadoReserva, string> = {
  pendiente: 'bg-[rgb(var(--status-pending-bg))] text-[rgb(var(--status-pending-text))] border-[rgb(var(--status-pending-border))]',
  confirmada: 'bg-[rgb(var(--status-confirmed-bg))] text-[rgb(var(--status-confirmed-text))] border-[rgb(var(--status-confirmed-border))]',
  cancelada: 'bg-[rgb(var(--status-canceled-bg))] text-[rgb(var(--status-canceled-text))] border-[rgb(var(--status-canceled-border))]',
  completada: 'bg-[rgb(var(--status-completed-bg))] text-[rgb(var(--status-completed-text))] border-[rgb(var(--status-completed-border))]'
}
