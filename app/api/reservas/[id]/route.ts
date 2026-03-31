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

    // Actualizar en Supabase
    const { data: reserva, error } = await supabase
      .from('reservas')
      .update({
        estado: result.data.estado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, codigo, estado')
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

    return NextResponse.json({
      success: true,
      data: reserva,
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
