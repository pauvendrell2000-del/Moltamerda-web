import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

// ── Esquema de validación ─────────────────────────────────────────
const reservaSchema = z.object({
  nombre: z.string().min(2),
  tipo_cliente: z.enum(['empresa', 'particular']),
  empresa: z.string().optional().nullable(),
  email: z.string().email(),
  telefono: z.string().min(9).max(15),
  tipo_servicio: z.enum([
    'maquinas_agricolas',
    'maquinaria_industrial',
    'naves_piscinas',
    'naves_ganaderas',
    'fumigacion_hipicas',
    'fumigacion_centros_caninos',
  ]),
  superficie_m2: z.coerce.number().min(10).max(10000),
  direccion: z.string().min(5),
  ciudad: z.string().min(2),
  codigo_postal: z.string().regex(/^\d{5}$/),
  fecha: z.string().min(1),
  franja_horaria: z.enum(['manana', 'tarde']),
  observaciones: z.string().max(500).optional().nullable(),
})

// ── Generador de código único ─────────────────────────────────────
async function generarCodigoUnico(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string> {
  let intentos = 0
  while (intentos < 10) {
    const num = Math.floor(1000 + Math.random() * 9000)
    const codigo = `LIM-${num}`

    const { data } = await supabase
      .from('reservas')
      .select('id')
      .eq('codigo', codigo)
      .maybeSingle()

    if (!data) return codigo
    intentos++
  }
  // Fallback con timestamp
  return `LIM-${Date.now().toString().slice(-4)}`
}

// ── POST /api/reservas ────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar
    const result = reservaSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Datos inválidos', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const datos = result.data
    const supabase = await createClient()

    // Generar código único
    const codigo = await generarCodigoUnico(supabase)

    // Insertar en Supabase
    const { data: reserva, error } = await supabase
      .from('reservas')
      .insert({
        codigo,
        nombre: datos.nombre,
        tipo_cliente: datos.tipo_cliente,
        empresa: datos.tipo_cliente === 'empresa' ? (datos.empresa ?? null) : null,
        email: datos.email,
        telefono: datos.telefono,
        tipo_servicio: datos.tipo_servicio,
        superficie_m2: datos.superficie_m2,
        direccion: datos.direccion,
        ciudad: datos.ciudad,
        codigo_postal: datos.codigo_postal,
        fecha: datos.fecha,
        franja_horaria: datos.franja_horaria,
        observaciones: datos.observaciones ?? null,
        estado: 'pendiente',
      })
      .select('id, codigo')
      .single()

    if (error) {
      console.error('Error insertando reserva:', error)
      return NextResponse.json(
        { success: false, error: 'Error al guardar la reserva' },
        { status: 500 }
      )
    }

    // Enviar email de confirmación (lazy - no falla el build si no está configurado)
    try {
      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'Limpieza Industrial <noreply@limpiezaindustrial.es>',
          to: datos.email,
          subject: `Reserva ${codigo} recibida - Limpieza Industrial`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1A2332; padding: 32px; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Reserva Recibida</h1>
                <p style="color: #00A878; margin: 8px 0 0; font-size: 14px;">Código: ${codigo}</p>
              </div>
              <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px;">
                <p style="color: #0F1923;">Hola ${datos.nombre},</p>
                <p style="color: #6B7280;">Hemos recibido tu solicitud de servicio correctamente.
                Nuestro equipo la revisará y te contactará en menos de 24 horas para confirmar.</p>
                <div style="background: white; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
                  <p style="color: #6B7280; font-size: 12px; margin: 0 0 4px;">Código de reserva</p>
                  <p style="color: #1A2332; font-size: 32px; font-weight: bold; font-family: monospace; margin: 0;">${codigo}</p>
                </div>
                <p style="color: #6B7280; font-size: 14px;">Fecha solicitada: ${datos.fecha} (${datos.franja_horaria === 'manana' ? 'Mañana 8:00-14:00' : 'Tarde 14:00-20:00'})</p>
                <p style="color: #6B7280; font-size: 12px; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                  Si tienes alguna pregunta, contáctanos en info@limpiezaindustrial.es
                </p>
              </div>
            </div>
          `,
        })
      }
    } catch (emailError) {
      // El email es opcional - no falla la creación de reserva
      console.warn('No se pudo enviar email de confirmación:', emailError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: reserva.id,
        codigo: reserva.codigo,
      },
    })
  } catch (err) {
    console.error('Error en POST /api/reservas:', err)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
