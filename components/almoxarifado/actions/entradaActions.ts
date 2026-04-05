"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import {
  applyStockAdjustments,
  buildStockAdjustments,
  invertStockAdjustments,
} from "@/components/almoxarifado/actions/material-movimentacao-helpers"

export async function saveEntradaAction(
  data: {
    material_id: string
    quantidade: number
    data: string
    cliente_id?: string
    observacao?: string
  },
  id?: string
) {
  const supabase = await createClient()
  try {
    const nextSnapshot = {
      clienteId: data.cliente_id || null,
      materialId: data.material_id,
      quantidade: data.quantidade,
      tipo: "ENTRADA" as const,
    }

    if (id) {
      const { data: currentMovimentacao, error: currentMovimentacaoError } = await supabase
        .from("material_movimentacoes")
        .select("id, cliente_id, material_categoria_id, quantidade, tipo")
        .eq("id", id)
        .maybeSingle()

      if (currentMovimentacaoError) throw currentMovimentacaoError
      if (!currentMovimentacao) {
        return { ok: false, error: "Movimentação de entrada não encontrada." }
      }

      const adjustments = buildStockAdjustments(
        {
          clienteId: currentMovimentacao.cliente_id,
          materialId: currentMovimentacao.material_categoria_id,
          quantidade: Number(currentMovimentacao.quantidade || 0),
          tipo: currentMovimentacao.tipo,
        },
        nextSnapshot
      )

      await applyStockAdjustments(supabase, adjustments)

      const { error } = await supabase
        .from("material_movimentacoes")
        .update({
          material_categoria_id: data.material_id,
          quantidade: data.quantidade,
          data: data.data,
          cliente_id: data.cliente_id || null,
          observacao: data.observacao || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        await applyStockAdjustments(supabase, invertStockAdjustments(adjustments))
        throw error
      }
    } else {
      const adjustments = buildStockAdjustments(undefined, nextSnapshot)

      await applyStockAdjustments(supabase, adjustments)

      const { error } = await supabase.from("material_movimentacoes").insert({
        material_categoria_id: data.material_id,
        quantidade: data.quantidade,
        data: data.data,
        cliente_id: data.cliente_id || null,
        observacao: data.observacao || null,
        tipo: "ENTRADA",
      })

      if (error) {
        await applyStockAdjustments(supabase, invertStockAdjustments(adjustments))
        throw error
      }
    }

    revalidatePath("/entrada")
    revalidatePath("/fluxoDeMaterial")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

export async function deleteEntradaAction(id: string) {
  const supabase = await createClient()
  try {
    const { data: currentMovimentacao, error: currentMovimentacaoError } = await supabase
      .from("material_movimentacoes")
      .select("id, cliente_id, material_categoria_id, quantidade, tipo")
      .eq("id", id)
      .maybeSingle()

    if (currentMovimentacaoError) throw currentMovimentacaoError
    if (!currentMovimentacao) {
      return { ok: false, error: "Movimentação de entrada não encontrada." }
    }

    const adjustments = buildStockAdjustments(
      {
        clienteId: currentMovimentacao.cliente_id,
        materialId: currentMovimentacao.material_categoria_id,
        quantidade: Number(currentMovimentacao.quantidade || 0),
        tipo: currentMovimentacao.tipo,
      },
      undefined
    )

    await applyStockAdjustments(supabase, adjustments)

    const { error } = await supabase.from("material_movimentacoes").delete().eq("id", id)
    if (error) {
      await applyStockAdjustments(supabase, invertStockAdjustments(adjustments))
      throw error
    }

    revalidatePath("/entrada")
    revalidatePath("/fluxoDeMaterial")
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}
