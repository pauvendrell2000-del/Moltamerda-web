import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

const patchSchema = z.object({
  estado: z.enum(['pendiente', 'confirmada', 'cancelada', 'completada']),
})

// ── PATCH /api/reservas/[id] ──────────────────────────────────────
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Validar body
    const body = await request.json()
    const result = patchSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Estado inválido', details: result.error.flatten() },
        { status: 400 }
      )
    }

    // Actualizar en Supabase (necesitamos todos los datos para el email)
    const { data: reserva, error } = await supabase
      .from('reservas')
      .update({
        estado: result.data.estado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error actualizando reserva:', error)
      return NextResponse.json(
        { success: false, error: 'Error al actualizar la reserva' },
        { status: 500 }
      )
    }

    if (!reserva) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Enviar email de confirmación al cliente cuando el admin confirma
    if (result.data.estado === 'confirmada' && process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@moltamerda.net'

        await resend.emails.send({
          from,
          to: reserva.email,
          subject: `Reserva ${reserva.codigo} confirmada - Limpieza Industrial`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #1A2332; padding: 32px; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">¡Reserva Confirmada!</h1>
                <p style="color: #00A878; margin: 8px 0 0; font-size: 14px;">Código: ${reserva.codigo}</p>
              </div>
              <div style="background: #f8fafc; padding: 32px; border-radius: 0 0 12px 12px;">
                <p style="color: #0F1923;">Hola ${reserva.nombre},</p>
                <p style="color: #6B7280;">Tu reserva ha sido <strong style="color: #00A878;">confirmada</strong>. Te esperamos el día indicado.</p>
                <div style="background: white; border: 2px solid #00A878; border-radius: 8px; padding: 20px; margin: 24px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 6px 0; color: #6B7280; font-size: 14px; width: 40%;">Código</td>
                      <td style="padding: 6px 0; color: #1A2332; font-size: 14px; font-weight: bold; font-family: monospace;">${reserva.codigo}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6B7280; font-size: 14px;">Fecha</td>
                      <td style="padding: 6px 0; color: #0F1923; font-size: 14px; font-weight: 600;">${reserva.fecha}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6B7280; font-size: 14px;">Horario</td>
                      <td style="padding: 6px 0; color: #0F1923; font-size: 14px;">${reserva.franja_horaria === 'manana' ? 'Mañana (8:00 - 14:00)' : 'Tarde (14:00 - 20:00)'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6B7280; font-size: 14px;">Dirección</td>
                      <td style="padding: 6px 0; color: #0F1923; font-size: 14px;">${reserva.direccion}, ${reserva.ciudad} ${reserva.codigo_postal}</td>
                    </tr>
                  </table>
                </div>
                <p style="color: #6B7280; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                  ¿Tienes alguna pregunta? Contáctanos en info@moltamerda.net
                </p>
              </div>
            </div>
          `,
        })
      } catch (emailError) {
        console.warn('No se pudo enviar email de confirmación al cliente:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: reserva.id, codigo: reserva.codigo, estado: reserva.estado },
    })
  } catch (err) {
    console.error('Error en PATCH /api/reservas/[id]:', err)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ── GET /api/reservas/[id] ────────────────────────────────────────
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verificar autenticación
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { data: reserva, error } = await supabase
      .from('reservas')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !reserva) {
      return NextResponse.json(
        { success: false, error: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: reserva })
  } catch (err) {
    console.error('Error en GET /api/reservas/[id]:', err)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
