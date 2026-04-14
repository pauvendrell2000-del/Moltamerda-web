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

    // Enviar emails (no falla la reserva si hay error de email)
    try {
      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@moltamerda.net'

        const LABELS_SERVICIO: Record<string, string> = {
          maquinas_agricolas: 'Limpieza Máquinas Agrícolas',
          maquinaria_industrial: 'Limpieza Maquinaria Industrial',
          naves_piscinas: 'Limpieza Naves y Piscinas',
          naves_ganaderas: 'Limpieza Naves Ganaderas',
          fumigacion_hipicas: 'Fumigación Hípicas',
          fumigacion_centros_caninos: 'Fumigación Centros Caninos',
        }

        // Email de notificación al administrador
        if (process.env.RESEND_NOTIFY_EMAIL) {
          await resend.emails.send({
            from,
            to: process.env.RESEND_NOTIFY_EMAIL,
            subject: `Nueva reserva ${codigo} - ${datos.nombre}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1A2332; padding: 32px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">Nueva Reserva</h1>
                  <p style="color: #00A878; margin: 8px 0 0; font-size: 14px;">Código: ${codigo}</p>
                </div>
                <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td colspan="2" style="padding: 8px 0; border-bottom: 2px solid #e2e8f0;">
                        <strong style="color: #1A2332; font-size: 16px;">Datos del cliente</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280; font-size: 14px; width: 40%;">Nombre</td>
                      <td style="padding: 8px 0; color: #0F1923; font-size: 14px; font-weight: 600;">${datos.nombre}</td>
                    </tr>
                    ${datos.tipo_cliente === 'empresa' ? `
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Empresa</td>
                      <td style="padding: 8px 0; color: #0F1923; font-size: 14px; font-weight: 600;">${datos.empresa ?? '-'}</td>
                    </tr>` : ''}
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Email</td>
                      <td style="padding: 8px 0; color: #0F1923; font-size: 14px;"><a href="mailto:${datos.email}" style="color: #00A878;">${datos.email}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Teléfono</td>
                      <td style="padding: 8px 0; color: #0F1923; font-size: 14px;"><a href="tel:${datos.telefono}" style="color: #00A878;">${datos.telefono}</a></td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding: 16px 0 8px; border-bottom: 2px solid #e2e8f0;">
                        <strong style="color: #1A2332; font-size: 16px;">Detalles del servicio</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Servicio</td>
                      <td style="padding: 8px 0; color: #0F1923; font-size: 14px; font-weight: 600;">${LABELS_SERVICIO[datos.tipo_servicio] ?? datos.tipo_servicio}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Superficie</td>
                      <td style="padding: 8px 0; color: #0F1923; font-size: 14px;">${datos.superficie_m2} m²</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Dirección</td>
                      <td style="padding: 8px 0; color: #0F1923; font-size: 14px;">${datos.direccion}, ${datos.ciudad} ${datos.codigo_postal}</td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding: 16px 0 8px; border-bottom: 2px solid #e2e8f0;">
                        <strong style="color: #1A2332; font-size: 16px;">Fecha y horario</strong>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Fecha</td>
                      <td style="padding: 8px 0; color: #0F1923; font-size: 14px; font-weight: 600;">${datos.fecha}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280; font-size: 14px;">Franja horaria</td>
                      <td style="padding: 8px 0; color: #0F1923; font-size: 14px;">${datos.franja_horaria === 'manana' ? 'Mañana (8:00 - 14:00)' : 'Tarde (14:00 - 20:00)'}</td>
                    </tr>
                    ${datos.observaciones ? `
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280; font-size: 14px; vertical-align: top;">Observaciones</td>
                      <td style="padding: 8px 0; color: #0F1923; font-size: 14px;">${datos.observaciones}</td>
                    </tr>` : ''}
                  </table>
                  <div style="margin-top: 24px; text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL ?? ''}/ca/admin/dashboard" style="display: inline-block; background: #1A2332; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      Ver en el panel de administración
                    </a>
                  </div>
                </div>
              </div>
            `,
          })
        }
      }
    } catch (emailError) {
      // El email es opcional - no falla la creación de reserva
      console.warn('No se pudo enviar email:', emailError)
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
